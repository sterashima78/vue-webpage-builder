import { Ref, ref, computed } from "@vue/composition-api";

interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
}

interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

declare const ResizeObserver: {
  prototype: ResizeObserver;
  new (callback: ResizeObserverCallback): ResizeObserver;
};
type ReadonlyArray = readonly any[];
export const useVirtualScroll = (
  onMounted: CallableFunction,
  items: Ref<ReadonlyArray>,
  wrapper: Ref<HTMLElement | null>,
  itemHeight: number
) => {
  const wrapperHeight = ref(500);
  const scrollPosition = ref(0);
  const itemNum = computed(
    () => Math.floor(wrapperHeight.value / itemHeight) + 2
  );
  const itemIndex = computed(() =>
    Math.floor(scrollPosition.value / itemHeight)
  );
  onMounted(() => {
    if (!wrapper.value) return;
    new ResizeObserver(([{ target }]) => {
      wrapperHeight.value = target.clientHeight;
    }).observe(wrapper.value);
    wrapperHeight.value = wrapper.value.clientHeight;
  });
  const handleScroll = (scroll: number) => {
    scrollPosition.value = scroll;
  };
  const innerStyle = computed(() => ({
    height: `${items.value.length * itemHeight}px`
  }));
  const listContainerStyle = computed(() => ({
    margin: "0px",
    padding: "0px",
    position: "relative",
    top: `${itemIndex.value * itemHeight}px`
  }));
  const displayedComponents = computed(() =>
    items.value.slice(itemIndex.value, itemIndex.value + itemNum.value)
  );
  return {
    handleScroll,
    innerStyle,
    listContainerStyle,
    displayedComponents
  };
};
