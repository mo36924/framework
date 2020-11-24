import type { JSX } from "#preact-lock";
export type StyleProps = JSX.IntrinsicElements["style"];
export const Style = (props: StyleProps) => <style {...props} />;
