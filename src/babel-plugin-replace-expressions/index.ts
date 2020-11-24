import type { default as babel, PluginObj, PluginPass } from "@babel/core";

export type Options = {
  [key: string]: any;
};

type State = PluginPass & {
  replaceOptions: {
    identifier: string;
    searchNode: babel.types.Expression;
    replaceNode: babel.types.Expression;
  }[];
};

export default ({ types: t, template }: typeof babel, options: Options): PluginObj<State> => {
  const replaceOptions = Object.entries(options)
    .sort((a, b) => b[0].length - a[0].length)
    .map(([searchValue, replaceValue]) => ({
      identifier: searchValue.match(/^(typeof\s+)?([A-Za-z_$][A-Za-z0-9_$]*)/)?.[2] || "",
      searchNode: template.expression.ast(searchValue),
      replaceNode: template.expression.ast(`${replaceValue}`),
    }));

  for (const { identifier, searchNode, replaceNode } of replaceOptions) {
    // isNodesEquivalent
    if (t.isMemberExpression(searchNode) && (searchNode as any).optional === undefined) {
      replaceOptions.push({ identifier, searchNode: { ...searchNode, optional: null }, replaceNode });
    }
  }

  return {
    name: "replace-expressions",
    pre(file) {
      const globals = (file.scope as any).globals;
      this.replaceOptions = replaceOptions.filter(({ identifier }) => globals[identifier]);
    },
    visitor: {
      Expression(path, state) {
        const { node, scope } = path;

        const replaceOption = state.replaceOptions.find(({ identifier, searchNode }) => {
          return t.isNodesEquivalent(node, searchNode) && !scope.hasBinding(identifier, true);
        });

        if (!replaceOption) {
          return;
        }

        path.replaceWith(t.cloneDeep(replaceOption.replaceNode));
      },
    },
  };
};
