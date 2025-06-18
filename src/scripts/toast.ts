export interface ToastOptions {
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center";
}

export class ToastManager {
  private container: HTMLElement | null = null;

  constructor() {
    this.initContainer();
  }

  private initContainer(): void {
    // 기존 컨테이너가 있다면 제거
    const existingContainer = document.getElementById("toast-container");
    if (existingContainer) {
      existingContainer.remove();
    }

    // 새 컨테이너 생성
    this.container = document.createElement("div");
    this.container.id = "toast-container";
    this.container.className =
      "fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(this.container);
  }

  show(message: string, options: ToastOptions = {}): void {
    if (!this.container) return;

    const { type = "info", duration = 4000, position = "top-right" } = options;

    // 토스트 엘리먼트 생성
    const toast = document.createElement("div");
    toast.className = `
      pointer-events-auto transform transition-all duration-300 ease-in-out
      translate-x-full opacity-0 max-w-sm w-full
      bg-white rounded-lg shadow-lg border-l-4 p-4 mb-2
      ${this.getTypeStyles(type)}
    `.trim();

    // 메시지 내용
    toast.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          ${this.getIcon(type)}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">${message}</p>
        </div>
        <div class="ml-auto pl-3">
          <button class="toast-close inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // 컨테이너에 추가
    this.container.appendChild(toast);

    // 애니메이션으로 표시
    requestAnimationFrame(() => {
      toast.classList.remove("translate-x-full", "opacity-0");
      toast.classList.add("translate-x-0", "opacity-100");
    });

    // 닫기 버튼 이벤트
    const closeButton = toast.querySelector(".toast-close");
    closeButton?.addEventListener("click", () => this.hide(toast));

    // 자동 닫기
    if (duration > 0) {
      setTimeout(() => this.hide(toast), duration);
    }
  }

  private hide(toast: HTMLElement): void {
    toast.classList.remove("translate-x-0", "opacity-100");
    toast.classList.add("translate-x-full", "opacity-0");

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  private getTypeStyles(type: string): string {
    switch (type) {
      case "success":
        return "border-green-400 bg-green-50";
      case "error":
        return "border-red-400 bg-red-50";
      case "warning":
        return "border-yellow-400 bg-yellow-50";
      case "info":
      default:
        return "border-blue-400 bg-blue-50";
    }
  }

  private getIcon(type: string): string {
    switch (type) {
      case "success":
        return `<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>`;
      case "error":
        return `<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>`;
      case "warning":
        return `<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>`;
      case "info":
      default:
        return `<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>`;
    }
  }
}

// 전역 토스트 인스턴스
let toastManager: ToastManager | null = null;

export function showToast(message: string, options: ToastOptions = {}): void {
  if (!toastManager) {
    toastManager = new ToastManager();
  }
  toastManager.show(message, options);
}
