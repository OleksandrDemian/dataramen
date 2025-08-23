const subscribers: Map<string, { label: string; callback: VoidFunction }[]> = new Map();

const handleKeyUp = (event: KeyboardEvent) => {
  const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
  if (
    ["input", "textarea", "select"].includes(tag) ||
    (event.target as HTMLElement)?.isContentEditable
  ) {
    return; // Ignore key events from input fields
  }

  const callback = subscribers.get(event.key.toLowerCase());
  if (callback && callback.length > 0) {
    callback[callback.length - 1].callback();
  }
};

export const subscribe = (key: string, callback: VoidFunction, label: string = ""): VoidFunction => {
  const lowerKey = key.toLowerCase();
  const existing = subscribers.get(key);
  if (existing) {
    subscribers.set(key, [...existing, { callback, label }]);
  } else {
    subscribers.set(lowerKey, [{ callback, label }]);
  }

  return () => {
    const lowerKey = key.toLowerCase();
    const existing = subscribers.get(lowerKey);
    // Only remove if the current callback matches
    if (existing) {
      subscribers.set(lowerKey, existing.filter((cb) => cb.callback !== callback));
    }
  };
}

window.addEventListener("keyup", handleKeyUp);
