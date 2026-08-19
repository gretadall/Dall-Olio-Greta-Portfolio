"use client";

import { useRef, useState } from "react";

export function ReorderableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  renderItem: (
    item: T,
    dragHandle: { onPointerDown: (e: React.PointerEvent) => void }
  ) => React.ReactNode;
}) {
  const [order, setOrder] = useState(items);
  const idsKey = items.map((it) => it.id).join(",");
  const idsKeyRef = useRef(idsKey);
  if (idsKeyRef.current !== idsKey) {
    idsKeyRef.current = idsKey;
    setOrder(items);
  }

  const listRef = useRef<HTMLUListElement>(null);
  const draggingId = useRef<string | null>(null);
  const [draggingIdState, setDraggingIdState] = useState<string | null>(null);

  function handlePointerDown(id: string, e: React.PointerEvent) {
    draggingId.current = id;
    setDraggingIdState(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingId.current || !listRef.current) return;
    const children = Array.from(listRef.current.children) as HTMLElement[];
    const y = e.clientY;

    setOrder((prev) => {
      const fromIndex = prev.findIndex((it) => it.id === draggingId.current);
      if (fromIndex === -1) return prev;

      if (fromIndex > 0) {
        const aboveRect = children[fromIndex - 1].getBoundingClientRect();
        if (y < aboveRect.top + aboveRect.height / 2) {
          const next = [...prev];
          [next[fromIndex - 1], next[fromIndex]] = [
            next[fromIndex],
            next[fromIndex - 1],
          ];
          return next;
        }
      }
      if (fromIndex < prev.length - 1) {
        const belowRect = children[fromIndex + 1].getBoundingClientRect();
        if (y > belowRect.top + belowRect.height / 2) {
          const next = [...prev];
          [next[fromIndex + 1], next[fromIndex]] = [
            next[fromIndex],
            next[fromIndex + 1],
          ];
          return next;
        }
      }
      return prev;
    });
  }

  function handlePointerUp() {
    if (!draggingId.current) return;
    draggingId.current = null;
    setDraggingIdState(null);
    onReorder(order.map((it) => it.id));
  }

  return (
    <ul
      ref={listRef}
      className="flex flex-col gap-3"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {order.map((item) => (
        <li
          key={item.id}
          style={{ opacity: draggingIdState === item.id ? 0.5 : 1 }}
        >
          {renderItem(item, {
            onPointerDown: (e) => handlePointerDown(item.id, e),
          })}
        </li>
      ))}
    </ul>
  );
}
