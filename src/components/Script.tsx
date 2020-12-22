import type { JSX } from "~/preact-lock";
export type Props = JSX.IntrinsicElements["script"];
export const Script = (props: Props) => <script {...props} />;
