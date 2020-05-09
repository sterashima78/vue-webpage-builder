import { RouteNodeTree } from "@/types";
import { create, createRoot } from "@/domain/nodes";
const list = ["default", "primary", "success", "info", "warning", "danger"];

export const init = (): RouteNodeTree => ({
  "/": createRoot([
    create({
      tag: "router-link",
      text: "to some path",
      attributes: {
        to: "/some-path"
      }
    }),
    ...[
      { round: false, plain: false },
      { round: true, plain: false },
      { round: false, plain: true }
    ].map(opt =>
      create(
        {
          tag: "el-row"
        },
        list.map(type =>
          create({
            tag: "el-button",
            text: type,
            attributes: { type, ...opt }
          })
        )
      )
    )
  ]),
  "/some-path": createRoot([
    create({
      name: "Home Link",
      tag: "router-link",
      text: "to home",
      attributes: {
        to: "/"
      }
    }),
    create(
      {
        name: "Drop Down",
        tag: "el-dropdown"
      },
      [
        create(
          {
            tag: "span",
            classes: ["el-dropdown-link"]
          },
          [
            create({
              tag: "span",
              text: "Dropdown List"
            }),
            create({
              tag: "i",
              classes: ["el-icon-arrow-down", "el-icon--right"]
            })
          ]
        ),
        create(
          {
            tag: "el-dropdown-menu",
            slot: "dropdown",
            classes: ["el-dropdown-link"]
          },
          [
            create({
              tag: "el-dropdown-item",
              text: "Action 1"
            }),
            create({
              tag: "el-dropdown-item",
              text: "Action 2"
            }),
            create({
              tag: "el-dropdown-item",
              text: "Action 3"
            }),
            create({
              tag: "el-dropdown-item",
              text: "Action 4",
              attributes: {
                disabled: true
              }
            }),
            create({
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
  ])
});
