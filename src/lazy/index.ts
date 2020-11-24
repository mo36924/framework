import { ComponentType, jsx } from "#preact-lock";

export const lazy = <T>(
  loader: () => Promise<{ default: ComponentType<T> }>
): ComponentType<T> & { load: () => Promise<any> } => {
  let promise: any;
  let component: any;
  let error: any;

  const load = () =>
    (promise ||= loader().then(
      (exports: any) => {
        component = exports.default;
      },
      (err: any) => {
        error = err;
      }
    ));

  const Lazy = (props: any) => {
    if (error) {
      throw error;
    }

    if (!component) {
      load();
      throw promise;
    }

    return jsx(component, props);
  };

  Lazy.load = load;
  return Lazy;
};
