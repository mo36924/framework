import type { Props } from "./Html";

export const Html = ({ lang, id, className, children }: Props) => {
  const html = document.documentElement;

  if (lang) {
    html.lang = lang;
  } else {
    html.removeAttribute("lang");
  }

  if (id) {
    html.id = id;
  } else {
    html.removeAttribute("id");
  }

  if (className) {
    html.className = className;
  } else {
    html.removeAttribute("className");
  }

  return children;
};
