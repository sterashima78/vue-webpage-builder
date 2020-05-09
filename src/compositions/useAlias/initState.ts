import { create } from "@/domain/nodes";
const list = ["default", "primary", "success", "info", "warning", "danger"];

export const template = () => ({
  Buttons: {
    node: create(
      {
        tag: "el-row"
      },
      list.map(type =>
        create({
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
    node: create(
      {
        tag: "el-aside",
        attributes: {
          width: "200px"
        },
        style: {
          "background-color": "rgb(238, 241, 246)"
        }
      },
      [
        create(
          {
            tag: "el-menu"
          },
          [
            ...[1, 2, 3].map(index =>
              create(
                {
                  tag: "el-submenu",
                  attributes: {
                    index: `${index}`
                  }
                },
                [
                  create({
                    tag: "span",
                    text: `Menu${index}`,
                    slot: "title"
                  }),
                  create(
                    {
                      tag: "el-menu-item-group"
                    },
                    [
                      create({
                        tag: "span",
                        text: "Group1",
                        slot: "title"
                      }),
                      create({
                        tag: "el-menu-item",
                        text: "Option 1"
                      }),
                      create({
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
