import type { JSX } from "~/preact-lock";
export type ScriptProps = JSX.IntrinsicElements["script"];
export const Script = (props: ScriptProps) => <script {...props} />;
