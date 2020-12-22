import type { Props } from "./Title";
export const Title = (props: Props) => {
  document.title = props.children;
  return null;
};
