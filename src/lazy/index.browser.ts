import { useForceUpdate } from "#hooks/useForceUpdate";
import { ComponentType, jsx } from "#preact-lock";

export const lazy = <T>(
  loader: () => Promise<{ default: ComponentType<T> }>
): ComponentType<T> & { load: () => Promise<any> } => {
  let promise: Promise<any> | undefined;
  let component: ComponentType<T> | null = null;
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

  const Lazy = (props: T) => {
    const forceUpdate = useForceUpdate();
    if (error) {
      throw error;
    }
    component || load().then(forceUpdate);
    return component && jsx(component, props);
  };
  Lazy.load = load;
  return Lazy;
};
