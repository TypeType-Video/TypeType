import { useCallback, useLayoutEffect, useRef } from "react";

export function useFlipList(orderKey: string) {
  const elements = useRef<Map<string, HTMLElement>>(new Map());
  const previous = useRef<Map<string, DOMRect>>(new Map());
  const lastKey = useRef(orderKey);

  const register = useCallback((key: string, element: HTMLElement | null) => {
    if (element) elements.current.set(key, element);
    else elements.current.delete(key);
  }, []);

  useLayoutEffect(() => {
    const current = new Map<string, DOMRect>();
    for (const [key, element] of elements.current) {
      current.set(key, element.getBoundingClientRect());
    }
    if (lastKey.current !== orderKey) {
      for (const [key, rect] of current) {
        const before = previous.current.get(key);
        const element = elements.current.get(key);
        if (!before || !element) continue;
        const deltaY = before.top - rect.top;
        if (Math.abs(deltaY) < 1) continue;
        element.style.transition = "none";
        element.style.transform = `translateY(${deltaY}px)`;
        requestAnimationFrame(() => {
          element.style.transition = "transform 0.4s cubic-bezier(0.2, 0, 0, 1)";
          element.style.transform = "";
        });
      }
      lastKey.current = orderKey;
    }
    previous.current = current;
  }, [orderKey]);

  return register;
}
