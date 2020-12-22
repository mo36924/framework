import type { JSX } from "~/preact-lock";
export type Props = JSX.IntrinsicElements["style"];
export const Style = (props: Props) => <style {...props} />;
