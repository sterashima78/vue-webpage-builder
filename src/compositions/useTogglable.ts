import { ref } from "@vue/composition-api";

export const useTogglable = (initState = false) => {
  const isActive = ref(initState);
  return {
    isActive,
    on: () => (isActive.value = true),
    off: () => (isActive.value = false),
    toggle: () => (isActive.value = !isActive.value)
  };
};
