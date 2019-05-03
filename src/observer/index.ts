import { Subject } from "rxjs";
import { IVueNode } from "@/types";

export const editTargetSubject: Subject<IVueNode> = new Subject();
