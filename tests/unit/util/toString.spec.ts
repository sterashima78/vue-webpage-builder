import toString from "@/util/toString";

describe("toString", () => {
  it("no children full attr", () => {
    const query = {
      tree: [
        {
          id: "node1",
          name: "node1",
          children: []
        }
      ],
      nodes: {
        node1: {
          id: "node1",
          tag: "div",
          attr: {
            class: ["class1", "class2"],
            style: {
              width: "100px",
              height: "200px"
            },
            attrs: {
              "data-attr1": "attr1",
              "data-attr2": "attr2",
              "data-attr3": "attr3"
            }
          },
          childrenId: ["text"],
          parentId: ""
        }
      }
    };
    const actually = toString(query.tree, query.nodes);
    const a = `data-attr1="attr1" data-attr2="attr2" data-attr3="attr3"`;
    const c = `class="class1 class2"`;
    const s = `style="height:200px;width:100px;"`;
    expect(actually).toBe(`<div ${a} ${c} ${s}>text</div>`);
  });
  it("no children no attr", () => {
    const query = {
      tree: [
        {
          id: "node1",
          name: "node1",
          children: []
        }
      ],
      nodes: {
        node1: {
          id: "node1",
          tag: "span",
          attr: {},
          childrenId: ["text2"],
          parentId: ""
        }
      }
    };
    const actually = toString(query.tree, query.nodes);
    expect(actually).toBe(`<span>text2</span>`);
  });
});
