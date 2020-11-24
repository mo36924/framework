declare global {
  interface Window {
    onchangestate?: null | ((this: Window, ev: Event) => any);
  }
  interface WindowEventMap {
    changestate: Event;
  }
  const {
    __PROD__,
    __DEV__,
    __TEST__,
    __NODE__,
    __BROWSER__,
    __MODERN__,
    __MODULE__,
    __NOMODULE__,
  }: { [key: string]: true | undefined };
  const {
    __STORE_ID__,
    __ROOT_ID__,
    __STYLE_ID__,
    __BASE_URL__,
    __GRAPHQL_ENDPOINT__,
  }: { [key: string]: string | undefined };
}

export type {};
