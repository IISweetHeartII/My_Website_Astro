/* global document, requestAnimationFrame, setTimeout */

import type { LucideIcon } from "lucide";
import { AlertTriangle, CheckCircle2, CircleX, createElement, Info, X } from "lucide";

export interface ToastOptions {
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center";
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

    const { type = "info", duration = 4000, position: _position = "top-right" } = options;

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
        <div class="shrink-0">
          ${this.getIcon(type)}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">${message}</p>
        </div>
        <div class="ml-auto pl-3">
          <button class="toast-close inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
            ${this.createIconString(X, "h-5 w-5")}
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
      default:
        return "border-blue-400 bg-blue-50";
    }
  }

  /**
   * Lucide 아이콘을 SVG 문자열로 변환
   */
  private createIconString(Icon: LucideIcon, className: string): string {
    const iconElement = createElement(Icon);
    iconElement.setAttribute("class", className);
    return iconElement.outerHTML;
  }

  private getIcon(type: string): string {
    switch (type) {
      case "success":
        return this.createIconString(CheckCircle2, "h-5 w-5 text-green-400");
      case "error":
        return this.createIconString(CircleX, "h-5 w-5 text-red-400");
      case "warning":
        return this.createIconString(AlertTriangle, "h-5 w-5 text-yellow-400");
      default:
        return this.createIconString(Info, "h-5 w-5 text-blue-400");
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
