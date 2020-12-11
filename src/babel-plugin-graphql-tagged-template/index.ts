import { readFileSync } from "fs";
import type { default as babel, PluginObj } from "@babel/core";
import { BREAK, buildSchema, DefinitionNode, parse, stripIgnoredCharacters, validate, visit } from "graphql";
import { createPropName } from "#utils/createPropName";

export type Options = {
  schema: string;
};

export default ({ types: t }: typeof babel, options: Options): PluginObj => {
  const gql = readFileSync(options.schema || "schema.gql", "utf8") + "\nscalar Unknown";
  const schema = buildSchema(gql);

  return {
    visitor: {
      TaggedTemplateExpression(path) {
        const {
          tag,
          quasi: { quasis, expressions },
        } = path.node;

        if (!t.isIdentifier(tag)) {
          return;
        }

        const name = tag.name;

        if (name !== "gql" && name !== "useQuery" && name !== "useMutation") {
          return;
        }

        let query = "";

        for (let i = 0; i < quasis.length; i++) {
          query += `${i ? `$_` : ""}${quasis[i].value.raw}`;
        }

        if (name !== "gql") {
          let error = false;
          try {
            parse(query);
          } catch {
            error = true;
          }
          if (error) {
            query = `{${query}}`;
          } else {
            throw path.buildCodeFrameError("Syntax Error");
          }
        }

        let definitions: readonly DefinitionNode[];

        try {
          definitions = parse(query).definitions;
        } catch {
          throw path.buildCodeFrameError("Syntax Error");
        }

        const operationDefinition = definitions[0];
        let hasVariable = false;
        let expressionsLength = 0;

        visit(operationDefinition, {
          Variable(node) {
            if (node.name.value !== "_") {
              hasVariable = true;
              return BREAK;
            }

            expressionsLength++;
          },
        });

        if (
          definitions.length > 1 ||
          operationDefinition.kind !== "OperationDefinition" ||
          operationDefinition.name ||
          operationDefinition.variableDefinitions?.length ||
          hasVariable ||
          expressionsLength !== expressions.length
        ) {
          throw path.buildCodeFrameError("Support only anonymous query without variables and fragments");
        }

        query = "";
        let variables = "";

        for (let i = 0; i < quasis.length; i++) {
          const propName = createPropName(i - 1);
          query += `${i ? `$${propName}` : ""}${quasis[i].value.raw}`;
          variables += i ? `$${propName}:Unknown` : "";
        }

        if (name !== "gql") {
          query = `{${query}}`;
        }

        query = stripIgnoredCharacters(query).replace(/^(query|mutation|subscription)/, "");
        let operation = "";
        if (name === "useMutation") {
          operation = "mutation";
        } else if (name === "gql" && operationDefinition.operation !== "query") {
          operation = operationDefinition.operation;
        } else if (variables) {
          operation = operationDefinition.operation;
        }

        if (variables) {
          query = `${operation}(${variables})${query}`;
        } else {
          query = `${operation}${query}`;
        }

        let doc = parse(query);
        let errors = validate(schema, doc);
        for (const error of errors) {
          const match = /^Variable "(.*?)" of type "Unknown" used in position expecting type "(.*?)"\.$/.exec(
            error.message
          );
          if (match) {
            query = query.replace(`${match[1]}:Unknown`, `${match[1]}:${match[2]}`);
          } else {
            throw path.buildCodeFrameError(error.message);
          }
        }

        doc = parse(query);
        errors = validate(schema, doc);
        for (const error of errors) {
          throw path.buildCodeFrameError(error.message);
        }

        const properties = [t.objectProperty(t.identifier("query"), t.stringLiteral(query))];
        if (variables) {
          properties.push(
            t.objectProperty(
              t.identifier("variables"),
              t.objectExpression(
                expressions.map((expression, i) => t.objectProperty(t.identifier(createPropName(i)), expression as any))
              )
            )
          );
        }

        if (name === "gql") {
          path.replaceWith(t.objectExpression(properties));
        } else {
          path.replaceWith(t.callExpression(t.identifier(name), [t.objectExpression(properties)]));
        }
      },
    },
  };
};
