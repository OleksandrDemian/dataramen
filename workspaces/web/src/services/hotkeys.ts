const subscribers: Map<string, { label: string; callback: VoidFunction }[]> = new Map();

const getEventKey = (event: KeyboardEvent): string => {
  const values: string[] = [];
  if (event.ctrlKey) {
    values.push("CTRL");
  }

  if (event.altKey) {
    values.push("ALT");
  }

  if (event.shiftKey) {
    values.push("SHIFT");
  }

  if (event.metaKey) {
    values.push("META");
  }

  values.push(event.key.toLowerCase());

  return values.join("+");
};

const handleKeyUp = (event: KeyboardEvent) => {
  const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();

  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  if (
    ["input", "textarea", "select"].includes(tag) ||
    (event.target as HTMLElement)?.isContentEditable
  ) {
    return; // Ignore key events from input fields
  }

  const callback = subscribers.get(getEventKey(event));
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
