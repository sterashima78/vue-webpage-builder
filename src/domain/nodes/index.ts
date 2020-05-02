import { NodeTree, GetNodeName } from "@/types";
import clone from "lodash.clonedeep";
import { v4 as uuidv4 } from "uuid";

const getNodeName: GetNodeName = ({ name, tag }) => (name ? name : tag);

export const cloneNode = (tree: NodeTree): NodeTree => ({
  value: {
    ...clone(tree.value),
    id: uuidv4(),
    name: `${getNodeName(tree.value)}_copy`
  },
  forest: tree.forest.map(cloneNode)
});
