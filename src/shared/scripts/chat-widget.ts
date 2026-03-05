interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 10;
let messages: Message[] = [];
let isStreaming = false;

export function setupChatWidget(): void {
  const fab = document.getElementById("chat-fab");
  const win = document.getElementById("chat-window");
  const closeBtn = document.getElementById("chat-close");
  const input = document.getElementById("chat-input") as HTMLTextAreaElement;
  const sendBtn = document.getElementById("chat-send");
  const msgContainer = document.getElementById("chat-messages");

  if (!fab || !win || !closeBtn || !input || !sendBtn || !msgContainer) return;

  // Prevent re-initialization
  if (fab.dataset["initialized"] === "true") return;
  fab.dataset["initialized"] = "true";

  const toggle = () => {
    const isOpen = !win.classList.contains("chat-hidden");
    if (isOpen) {
      win.classList.add("chat-hidden");
      fab.classList.remove("chat-fab-hidden");
      fab.setAttribute("aria-expanded", "false");
    } else {
      win.classList.remove("chat-hidden");
      fab.classList.add("chat-fab-hidden");
      fab.setAttribute("aria-expanded", "true");
      input.focus();
      scrollToBottom(msgContainer);
    }
  };

  fab.addEventListener("click", toggle);
  closeBtn.addEventListener("click", toggle);

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !win.classList.contains("chat-hidden")) {
      toggle();
    }
  });

  // Send message
  const send = () => {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    input.value = "";
    autoResize(input);
    appendMessage(msgContainer, "user", text);
    messages.push({ role: "user", content: text });

    // Keep history bounded
    if (messages.length > MAX_HISTORY) {
      messages = messages.slice(-MAX_HISTORY);
    }

    streamResponse(msgContainer);
  };

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // Auto-resize textarea
  input.addEventListener("input", () => autoResize(input));
}

function autoResize(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
}

function scrollToBottom(container: HTMLElement) {
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

function appendMessage(
  container: HTMLElement,
  role: "user" | "assistant",
  content: string
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-msg chat-msg-${role}`;

  const avatar = document.createElement("div");
  avatar.className = "chat-msg-avatar";
  avatar.textContent = role === "assistant" ? "AI" : "You";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";

  if (role === "assistant") {
    bubble.innerHTML = renderMarkdown(content);
  } else {
    bubble.textContent = content;
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  scrollToBottom(container);
  return bubble;
}

async function streamResponse(container: HTMLElement) {
  isStreaming = true;
  const sendBtn = document.getElementById("chat-send");
  if (sendBtn) sendBtn.classList.add("chat-send-disabled");

  // Add loading bubble
  const bubble = appendMessage(container, "assistant", "");
  bubble.innerHTML = '<span class="chat-typing">생각하는 중...</span>';

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMsg =
        (errorData as { error?: string })?.error ??
        "일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.";
      bubble.innerHTML = `<span class="chat-error">${escapeHtml(errorMsg)}</span>`;
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";

    bubble.innerHTML = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();

        if (data === "[DONE]") continue;

        try {
          const { content } = JSON.parse(data) as { content: string };
          if (content) {
            fullContent += content;
            bubble.innerHTML = renderMarkdown(fullContent);
            scrollToBottom(container);
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    if (fullContent) {
      messages.push({ role: "assistant", content: fullContent });
      if (messages.length > MAX_HISTORY) {
        messages = messages.slice(-MAX_HISTORY);
      }
    } else if (!bubble.innerHTML) {
      bubble.innerHTML =
        '<span class="chat-error">답변을 생성하지 못했어요. 질문을 다시 해주세요.</span>';
    }
  } catch {
    bubble.innerHTML =
      '<span class="chat-error">연결이 불안정해요. 인터넷 연결을 확인해주세요.</span>';
  } finally {
    isStreaming = false;
    if (sendBtn) sendBtn.classList.remove("chat-send-disabled");
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return (
    escaped
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Links
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Line breaks
      .replace(/\n/g, "<br>")
  );
}
