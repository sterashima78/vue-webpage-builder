import clone from "lodash.clonedeep";

const ctx: Worker = self as any;
ctx.addEventListener("message", event => {
  ctx.postMessage(clone(event.data));
});
