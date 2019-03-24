import toString from "@/util/toString";

describe("toString", () => {
  describe("no children", () => {
    it("full attr", () => {
      const query = {
        top: "node1",
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
      const actually = toString(query.top, query.nodes);
      const a = `data-attr1="attr1" data-attr2="attr2" data-attr3="attr3"`;
      const c = `class="class1 class2"`;
      const s = `style="height:200px;width:100px;"`;
      expect(actually).toBe(`<div ${a} ${c} ${s}>text</div>`);
    });
    it("no attr", () => {
      const query = {
        top: "node1",
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
      const actually = toString(query.top, query.nodes);
      expect(actually).toBe(`<span>text2</span>`);
    });
  });
  describe("has children", () => {
    it("single", () => {
      const query = {
        top: "node1",
        nodes: {
          node1: {
            id: "node1",
            tag: "p",
            attr: {},
            childrenId: ["node2", "text1"],
            parentId: ""
          },
          node2: {
            id: "node1",
            tag: "span",
            attr: {},
            childrenId: ["text2"],
            parentId: "node1"
          }
        }
      };
      const actually = toString(query.top, query.nodes);
      expect(actually).toBe(`<p><span>text2</span> text1</p>`);
    });

    it("multi", () => {
      const query = {
        top: "node1",
        nodes: {
          node1: {
            id: "node1",
            tag: "p",
            attr: {},
            childrenId: ["node2", "text1", "node3"],
            parentId: ""
          },
          node2: {
            id: "node2",
            tag: "span",
            attr: {},
            childrenId: ["text2"],
            parentId: "node1"
          },
          node3: {
            id: "node3",
            tag: "span",
            attr: {},
            childrenId: ["text3"],
            parentId: "node1"
          }
        }
      };
      const actually = toString(query.top, query.nodes);
      expect(actually).toBe(
        `<p><span>text2</span> text1 <span>text3</span></p>`
      );
    });
  });
  describe("has grandson", () => {
    it("single", () => {
      const query = {
        top: "node1",
        nodes: {
          node1: {
            id: "node1",
            tag: "ul",
            attr: {},
            childrenId: ["node2"],
            parentId: ""
          },
          node2: {
            id: "node2",
            tag: "li",
            attr: {},
            childrenId: ["node3"],
            parentId: "node1"
          },
          node3: {
            id: "node3",
            tag: "span",
            attr: {},
            childrenId: ["text3"],
            parentId: "node2"
          }
        }
      };
      const actually = toString(query.top, query.nodes);
      expect(actually).toBe(`<ul><li><span>text3</span></li></ul>`);
    });
  });
  describe("format", () => {
    it("grand children", () => {
      const query = {
        top: "node1",
        nodes: {
          node1: {
            id: "node1",
            tag: "ul",
            attr: {},
            childrenId: ["node2"],
            parentId: ""
          },
          node2: {
            id: "node2",
            tag: "li",
            attr: {},
            childrenId: ["node3"],
            parentId: "node1"
          },
          node3: {
            id: "node3",
            tag: "span",
            attr: {},
            childrenId: ["text3"],
            parentId: "node2"
          }
        }
      };
      const actually = toString(query.top, query.nodes, true);
      expect(actually).toBe(`<ul>\n  <li><span>text3</span></li>\n</ul>`);
    });
  });
});
