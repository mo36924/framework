import { transformAsync, TransformOptions } from "@babel/core";
import { describe, test, expect } from "@jest/globals";
import plugin, { Options } from "./index";
import { join } from "path";

const options: TransformOptions = {
  babelrc: false,
  configFile: false,
  plugins: [[plugin, { schema: join(__filename, "../test.gql") } as Options]],
};

const transform = (code: string) => transformAsync(code, options);

describe("babel-plugin-graphql-tagged-template", () => {
  test("gql query", async () => {
    const result = await transform(`
      const id = 123;
      const offset = 2
      gql\`{
        user(id: \${id}, offset: \${offset}) {
          id
          name
        }
      }\`
    `);

    expect(result).toMatchInlineSnapshot(`
      const id = 123;
      const offset = 2;
      ({
        query: "query($a:Int!$b:Int){user(id:$a offset:$b){id name}}",
        variables: {
          a: id,
          b: offset,
        },
      });
    `);
  });

  test("gql mutation", async () => {
    const result = await transform(`
      const id = 123;
      const name = hoge
      gql\`mutation {
        createUser(id: \${id}, name: \${name}) {
          id
          name
        }
      }\`
    `);

    expect(result).toMatchInlineSnapshot(`
      const id = 123;
      const name = hoge;
      ({
        query: "mutation($a:Int!$b:String){createUser(id:$a name:$b){id name}}",
        variables: {
          a: id,
          b: name,
        },
      });
    `);
  });

  test("useQuery", async () => {
    const result = await transform(`
      const id = 123;
      const offset = 2
      useQuery\`
        user(id: \${id}, offset: \${offset}) {
          id
          name
        }
      \`
    `);

    expect(result).toMatchInlineSnapshot(`
      const id = 123;
      const offset = 2;
      useQuery({
        query: "query($a:Int!$b:Int){user(id:$a offset:$b){id name}}",
        variables: {
          a: id,
          b: offset,
        },
      });
    `);
  });

  test("useMutation", async () => {
    const result = await transform(`
      const id = 123;
      const name = hoge
      useMutation\`
        createUser(id: \${id}, name: \${name}) {
          id
          name
        }
      \`
    `);

    expect(result).toMatchInlineSnapshot(`
      const id = 123;
      const name = hoge;
      useMutation({
        query: "mutation($a:Int!$b:String){createUser(id:$a name:$b){id name}}",
        variables: {
          a: id,
          b: name,
        },
      });
    `);
  });
});
