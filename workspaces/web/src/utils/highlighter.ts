// highlighter.ts
const activeTimeouts = new WeakMap<Element, number>();

export const highlightSelector = (
  selector: string,
  duration = 2000,
  className = "temp-highlight",
) => {
  const elements = document.querySelectorAll(selector);

  elements.forEach((el) => {
    // remove existing timer if this element is already highlighted
    const existingTimeout = activeTimeouts.get(el);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    el.classList.add(className);

    const timeoutId = window.setTimeout(() => {
      el.classList.remove(className);
      activeTimeouts.delete(el);
    }, duration);

    activeTimeouts.set(el, timeoutId);
  });
}