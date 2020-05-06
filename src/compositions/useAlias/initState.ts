import { Node } from "@/types";
import { make, tree } from "fp-ts/lib/Tree";

const list = ["default", "primary", "success", "info", "warning", "danger"];

export const template = () => ({
  Buttons: {
    node: make<Node>(
      {
        id: "c1",
        tag: "el-row"
      },
      list.map(type =>
        tree.of({
          id: `c1-${type}`,
          tag: "el-button",
          text: type,
          attributes: { type }
        })
      )
    ),
    name: "Buttons"
  },
  SideBar: {
    name: "SideBar",
    node: make<Node>(
      {
        id: "sidebar",
        tag: "el-aside",
        attributes: {
          width: "200px"
        },
        style: {
          "background-color": "rgb(238, 241, 246)"
        }
      },
      [
        make<Node>(
          {
            id: "side-menu",
            tag: "el-menu"
          },
          [
            ...[1, 2, 3].map(index =>
              make<Node>(
                {
                  id: "submenu1",
                  tag: "el-submenu",
                  attributes: {
                    index: `${index}`
                  }
                },
                [
                  tree.of({
                    id: "submenu1-title",
                    tag: "span",
                    text: `Menu${index}`,
                    slot: "title"
                  }),
                  make<Node>(
                    {
                      id: "submenu-group1",
                      tag: "el-menu-item-group"
                    },
                    [
                      tree.of({
                        id: "submenu-group1-title",
                        tag: "span",
                        text: "Group1",
                        slot: "title"
                      }),
                      tree.of({
                        id: "submenu-group1-item1",
                        tag: "el-menu-item",
                        text: "Option 1"
                      }),
                      tree.of({
                        id: "submenu-group1-item2",
                        tag: "el-menu-item",
                        text: "Option 2"
                      })
                    ]
                  )
                ]
              )
            )
          ]
        )
      ]
    )
  }
});
