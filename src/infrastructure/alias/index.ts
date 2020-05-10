import { AliasDao } from "@/domain/alias";
import store from "store2";

const KEY = "alias";
export const aliasDao: AliasDao = {
  save: alias => store.set(KEY, alias),
  get: () => store.get(KEY)
};
