import { toNodeTree } from "../converter";

describe("converter", () => {
  describe("toNodeTree", () => {
    const fn = jest.fn();
    test("NodeData を NodeTreeに変換する", () => {
      expect(
        toNodeTree({
          tag: "v-hoge",
          data: {
            attrs: {
              id: "foo",
              foo: "bar"
            },
            domProps: {
              "data-hoge": "huga"
            },
            class: ["a", "b", "c"],
            style: {
              a: "b",
              b: "c"
            },
            on: {
              click: fn,
              hover: [fn]
            }
          },
          children: [
            "string",
            {
              tag: "span",
              data: {
                slot: "bar"
              },
              children: []
            },
            "string2"
          ]
        })
      ).toEqual({
        value: {
          id: "foo",
          tag: "v-hoge",
          classes: ["a", "b", "c"],
          style: {
            a: "b",
            b: "c"
          },
          domProps: {
            "data-hoge": "huga"
          },
          on: {
            click: fn
          },
          attributes: {
            foo: "bar"
          }
        },
        children: [
          "string",
          {
            value: {
              id: "",
              tag: "span",
              slot: "bar"
            },
            children: []
          },
          "string2"
        ]
      });
    });
  });
});
