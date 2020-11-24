import type { JSX } from "#preact-lock";
export type MetaProps = JSX.IntrinsicElements["meta"];
export const Meta = (props: MetaProps) => <meta {...props} />;
