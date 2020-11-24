export type TitleProps = {
  children: string;
};

export const Title = (props: TitleProps) => {
  document.title = props.children;
  return null;
};
