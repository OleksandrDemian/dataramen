export const isHtmlElement = (el: unknown): el is HTMLElement => {
  return el instanceof HTMLElement;
};
