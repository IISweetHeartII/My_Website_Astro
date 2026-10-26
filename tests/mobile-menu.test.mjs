import { afterEach, expect, test } from "bun:test";
import { setupMobileMenu } from "../src/shared/scripts/mobile-menu";

class MenuElement extends EventTarget {
  inert = true;
  attributes = new Map();
  classList = {
    add: (..._values) => {},
    remove: (..._values) => {},
  };
  focused = false;
  links = [];
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  contains(target) {
    return target === this || this.links.includes(target);
  }
  querySelectorAll() {
    return this.links;
  }
  focus() {
    this.focused = true;
  }
}
const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
afterEach(() => {
  globalThis.document = originalDocument;
  globalThis.window = originalWindow;
});
test("mobile menu unlocks only while open and restores scroll and focus on Escape", () => {
  const toggle = new MenuElement();
  const menu = new MenuElement();
  const close = new MenuElement();
  const doc = new EventTarget();
  Object.assign(doc, {
    body: { style: { overflow: "auto" } },
    getElementById: (id) =>
      ({
        "mobile-menu-toggle": toggle,
        "mobile-menu": menu,
        "mobile-menu-close": close,
      })[id],
  });
  globalThis.document = doc;
  globalThis.window = new EventTarget();
  setupMobileMenu();
  toggle.dispatchEvent(new Event("click"));
  expect(menu.inert).toBe(false);
  expect(menu.getAttribute("aria-hidden")).toBe("false");
  expect(document.body.style.overflow).toBe("hidden");
  expect(close.focused).toBe(true);
  doc.dispatchEvent(Object.assign(new Event("keydown"), { key: "Escape" }));
  expect(menu.inert).toBe(true);
  expect(menu.getAttribute("aria-hidden")).toBe("true");
  expect(document.body.style.overflow).toBe("auto");
  expect(toggle.focused).toBe(true);
});
