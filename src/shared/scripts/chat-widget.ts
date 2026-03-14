interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 20;
const STORAGE_KEY = "chat-messages";
let messages: Message[] = [];
let isStreaming = false;

function saveMessages() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage full or unavailable
  }
}

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Message[];
  } catch {
    // Corrupted data
  }
  return [];
}

function clearMessages() {
  messages = [];
  localStorage.removeItem(STORAGE_KEY);
}

export function setupChatWidget(): void {
  const fab = document.getElementById("chat-fab");
  const win = document.getElementById("chat-window");
  const closeBtn = document.getElementById("chat-close");
  const newChatBtn = document.getElementById("chat-new");
  const input = document.getElementById("chat-input") as HTMLTextAreaElement;
  const sendBtn = document.getElementById("chat-send");
  const msgContainer = document.getElementById("chat-messages");

  if (!fab || !win || !closeBtn || !input || !sendBtn || !msgContainer) return;

  // Prevent re-initialization
  if (fab.dataset.initialized === "true") return;
  fab.dataset.initialized = "true";

  // Restore saved messages
  messages = loadMessages();
  if (messages.length > 0) {
    restoreMessages(msgContainer, messages);
  }

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

  // New chat
  newChatBtn?.addEventListener("click", () => {
    if (isStreaming) return;
    clearMessages();
    // Keep only the welcome message
    const welcome = msgContainer.querySelector(".chat-welcome");
    msgContainer.innerHTML = "";
    if (welcome) msgContainer.appendChild(welcome);
    else renderWelcome(msgContainer);
  });

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

    if (messages.length > MAX_HISTORY) {
      messages = messages.slice(-MAX_HISTORY);
    }
    saveMessages();

    streamResponse(msgContainer);
  };

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  input.addEventListener("input", () => autoResize(input));

  // Suggestion chips
  const suggestions = document.getElementById("chat-suggestions");
  suggestions?.querySelectorAll<HTMLButtonElement>(".chat-suggestion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isStreaming) return;
      input.value = btn.textContent?.trim() ?? "";
      suggestions.style.display = "none";
      send();
    });
  });
}

function renderWelcome(container: HTMLElement) {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-msg chat-msg-assistant chat-welcome";

  const avatar = document.createElement("div");
  avatar.className = "chat-msg-avatar";
  avatar.textContent = "AI";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.innerHTML =
    "안녕하세요! 김덕환에 대해 궁금한 것이 있으시면 편하게 물어보세요.<br><br>프로젝트, 기술 스택, 경력 등 무엇이든 질문해주세요!";

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
}

function restoreMessages(container: HTMLElement, saved: Message[]) {
  for (const msg of saved) {
    appendMessage(container, msg.role, msg.content);
  }
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
      saveMessages();
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
  // Handle fenced code blocks (```) before escaping
  const codeBlocks: string[] = [];
  const placeholder = "CHATCODEBLOCK";
  const withCodeBlocks = text.replace(/```(?:\w*\n)?([\s\S]*?)```/g, (_, code: string) => {
    const escaped = escapeHtml(code.replace(/\n$/, ""));
    codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
    return `${placeholder}${codeBlocks.length - 1}END`;
  });

  const escaped = escapeHtml(withCodeBlocks);

  // Split into lines to handle block-level elements
  const lines = escaped.split("\n");
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${inlineMarkdown(listMatch[1] ?? "")}</li>`);
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push(line === "" ? "" : inlineMarkdown(line));
    }
  }
  if (inList) result.push("</ul>");

  // Join non-list lines with <br>, but don't add <br> around <ul> blocks
  let html = result
    .join("\n")
    .replace(/([^\n])\n(<ul>)/g, "$1<br>$2")
    .replace(/(<\/ul>)\n([^\n])/g, "$1<br>$2")
    .replace(/([^>])\n([^<])/g, "$1<br>$2")
    .replace(/\n/g, "");

  // Restore code blocks (un-escaped placeholders)
  html = html.replace(
    /CHATCODEBLOCK(\d+)END/g,
    (_, i: string) => codeBlocks[parseInt(i, 10)] ?? ""
  );

  return html;
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}
