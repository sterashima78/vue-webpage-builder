import { useState, toNodeData } from "../index";
import { make, tree } from "fp-ts/lib/Tree";
import { NodeTree, Node } from "@/types";
import { createLocalVue } from "@vue/test-utils";
import CompositionApi from "@vue/composition-api";
import Vue from "vue";
const localVue = createLocalVue();
Vue.use(CompositionApi);
describe("useState", () => {
  describe("toVNode", () => {
    test("NodeTree を VNode に変換する", () => {
      const node: NodeTree = make<Node>(
        {
          id: "root",
          tag: "div",
          text: "foo"
        },
        [
          tree.of<Node>({
            id: "c1",
            tag: "span",
            text: "hoge"
          }),
          make<Node>(
            {
              id: "div",
              tag: "div"
            },
            [
              tree.of<Node>({
                id: "c2",
                tag: "span",
                text: "hoge2"
              })
            ]
          ),
          tree.of<Node>({
            id: "c3",
            tag: "span",
            text: "hoge3"
          })
        ]
      );
      expect(toNodeData(node)).toEqual({
        tag: "div",
        data: {
          attrs: {
            id: "root"
          }
        },
        children: [
          {
            tag: "span",
            data: {
              attrs: {
                id: "c1"
              }
            },
            children: ["hoge"]
          },
          {
            tag: "div",
            data: {
              attrs: {
                id: "div"
              }
            },
            children: [
              {
                tag: "span",
                data: {
                  attrs: {
                    id: "c2"
                  }
                },
                children: ["hoge2"]
              }
            ]
          },
          {
            tag: "span",
            data: {
              attrs: {
                id: "c3"
              }
            },
            children: ["hoge3"]
          },
          "foo"
        ]
      });
    });
  });
});
