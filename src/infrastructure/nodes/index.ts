import { NodeDao } from "@/domain/nodes";
import store from "store2";

const KEY = "nodes";
export const nodeDao: NodeDao = {
  save: node => store.set(KEY, node),
  get: () => store.get(KEY)
};
