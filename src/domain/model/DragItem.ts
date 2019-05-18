export class DragItem {
  private draggingId: string = "";
  private dropTargetId: string = "";
  private hoverId: string = "";
  public constructor(opt: {
    draggingId?: string;
    dropTargetId?: string;
    hoverId?: string;
  }) {
    Object.assign(this, opt);
  }

  public get getDraggingId() {
    return this.draggingId;
  }

  public get getDropTargetId() {
    return this.dropTargetId;
  }

  public get getHoverId() {
    return this.hoverId;
  }
}
