import type { JSX } from "~/preact-lock";
export type Props = JSX.IntrinsicElements["meta"];
export const Meta = (props: Props) => <meta {...props} />;
