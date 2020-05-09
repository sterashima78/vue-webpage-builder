import { Node, RouteNodeTree } from "@/types";
const list = ["default", "primary", "success", "info", "warning", "danger"];
import { make, tree } from "fp-ts/lib/Tree";

export const init = (): RouteNodeTree => ({
  "/": make<Node>(
    {
      id: "root",
      tag: "div",
      style: {
        height: "100%"
      }
    },
    [
      make<Node>({
        id: "link",
        tag: "router-link",
        text: "to some path",
        attributes: {
          to: "/some-path"
        }
      }),
      make<Node>(
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
      make<Node>(
        {
          id: "c2",
          tag: "el-row"
        },
        list.map(type =>
          tree.of<Node>({
            id: `c2-${type}-round`,
            tag: "el-button",
            text: type,
            attributes: { type, round: true }
          })
        )
      ),
      make<Node>(
        {
          id: "c3",
          tag: "el-row"
        },
        list.map(type =>
          tree.of<Node>({
            id: `c3-${type}-plain`,
            tag: "el-button",
            text: type,
            attributes: { type, plain: true }
          })
        )
      )
    ]
  ),
  "/some-path": make<Node>(
    {
      id: "root",
      tag: "div",
      style: {
        height: "100%"
      }
    },
    [
      make<Node>({
        id: "link2",
        name: "Home Link",
        tag: "router-link",
        text: "to home",
        attributes: {
          to: "/"
        }
      }),
      make<Node>(
        {
          id: "dropdown",
          name: "Drop Down",
          tag: "el-dropdown"
        },
        [
          make<Node>(
            {
              id: `dropdown-link`,
              tag: "span",
              classes: ["el-dropdown-link"]
            },
            [
              tree.of<Node>({
                id: "list",
                tag: "span",
                text: "Dropdown List"
              }),
              tree.of<Node>({
                id: "icon",
                tag: "i",
                classes: ["el-icon-arrow-down", "el-icon--right"]
              })
            ]
          ),
          make<Node>(
            {
              id: `dropdown-menu`,
              tag: "el-dropdown-menu",
              slot: "dropdown",
              classes: ["el-dropdown-link"]
            },
            [
              tree.of<Node>({
                id: "menu-item-1",
                tag: "el-dropdown-item",
                text: "Action 1"
              }),
              tree.of<Node>({
                id: "menu-item-2",
                tag: "el-dropdown-item",
                text: "Action 2"
              }),
              tree.of<Node>({
                id: "menu-item-3",
                tag: "el-dropdown-item",
                text: "Action 3"
              }),
              tree.of<Node>({
                id: "menu-item-4",
                tag: "el-dropdown-item",
                text: "Action 4",
                attributes: {
                  disabled: true
                }
              }),
              tree.of<Node>({
                id: "menu-item-5",
                tag: "el-dropdown-item",
                text: "Action 5",
                attributes: {
                  divided: true
                }
              })
            ]
          )
        ]
      )
    ]
  )
});
