import { RouteNodeTree } from "@/types";
import { create, createRoot } from "@/domain/nodes";
import { template } from "@/compositions/useAlias/initState";
const { SideBar, Buttons, HeaderNav } = template();
export const init = (): RouteNodeTree => ({
  "/": createRoot([
    create(
      {
        tag: "el-container",
        style: {
          height: "100%"
        }
      },
      [
        SideBar.node,
        create(
          {
            tag: "el-container"
          },
          [
            HeaderNav.node,
            create(
              {
                tag: "el-main",
                name: "Main Contents"
              },
              [
                create({
                  tag: "router-link",
                  text: "to '/some-path'",
                  attributes: {
                    to: "/some-path"
                  }
                }),
                Buttons.node
              ]
            )
          ]
        )
      ]
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
    })
  ])
});
