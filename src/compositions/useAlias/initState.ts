import { create } from "@/domain/nodes";
const list = ["default", "primary", "success", "info", "warning", "danger"];

const DropDownMenu = () =>
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
  );
export const init = () => ({
  DropDownMenu: {
    name: "DropDownMenu",
    node: DropDownMenu()
  },
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
  HeaderNav: {
    name: "HeaderNav",
    node: create(
      {
        tag: "el-header",
        style: {
          "background-color": "#b3c0d1",
          "line-height": "60px"
        }
      },
      [DropDownMenu()]
    )
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
