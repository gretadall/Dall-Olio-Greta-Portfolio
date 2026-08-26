"use client";

import { useRef, useState } from "react";
import { useEditMode } from "./EditModeProvider";
import {
  updateHomeLayoutPosition,
  resetHomeLayoutPosition,
  type HomeLayoutTarget,
} from "@/app/edit/actions";

const LIMIT = 40;

export function Positionable({
  slotKey,
  target,
  position,
  children,
  className,
}: {
  slotKey: string;
  target: HomeLayoutTarget;
  position: { x: number; y: number } | null;
  children: React.ReactNode;
  className?: string;
}) {
  const { editMode } = useEditMode();
  const posKey = position ? `${position.x},${position.y}` : "0,0";
  const [prevPosKey, setPrevPosKey] = useState(posKey);
  const [pos, setPos] = useState(position ?? { x: 0, y: 0 });
  if (prevPosKey !== posKey) {
    setPrevPosKey(posKey);
    setPos(position ?? { x: 0, y: 0 });
  }

  const ref = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const style = {
    "--pos-x": `${pos.x}%`,
    "--pos-y": `${pos.y}%`,
  } as React.CSSProperties;

  if (!editMode) {
    return (
      <div className={`positionable ${className ?? ""}`} style={style}>
        {children}
      </div>
    );
  }

  function clamp(n: number) {
    return Math.max(-LIMIT, Math.min(LIMIT, n));
  }

  function onHandlePointerDown(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, baseX: pos.x, baseY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onHandlePointerMove(e: React.PointerEvent) {
    const state = dragState.current;
    const el = ref.current;
    if (!state || !el) return;
    const dxPct = ((e.clientX - state.startX) / el.offsetWidth) * 100;
    const dyPct = ((e.clientY - state.startY) / el.offsetHeight) * 100;
    setPos({ x: clamp(state.baseX + dxPct), y: clamp(state.baseY + dyPct) });
  }

  function onHandlePointerUp() {
    if (!dragState.current) return;
    dragState.current = null;
    setDragging(false);
    updateHomeLayoutPosition(target, slotKey, pos.x, pos.y).catch((err) => {
      window.alert(
        err instanceof Error ? err.message : "Errore durante il salvataggio."
      );
    });
  }

  function onReset(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPos({ x: 0, y: 0 });
    resetHomeLayoutPosition(target, slotKey).catch((err) => {
      window.alert(
        err instanceof Error ? err.message : "Errore durante il salvataggio."
      );
    });
  }

  const moved = pos.x !== 0 || pos.y !== 0;

  return (
    <div
      ref={ref}
      className={`positionable relative ${dragging ? "z-30" : ""} ${className ?? ""}`}
      style={style}
    >
      <button
        type="button"
        title="Trascina per spostare"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
        className="absolute -left-2 -top-2 z-20 flex h-6 w-6 touch-none cursor-grab items-center justify-center rounded-full border border-black/[.12] bg-white text-xs shadow active:cursor-grabbing dark:border-white/[.16] dark:bg-zinc-900"
      >
        ⠿
      </button>
      {moved && (
        <button
          type="button"
          title="Ripristina posizione"
          onClick={onReset}
          className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-xs text-white shadow"
        >
          ↺
        </button>
      )}
      {children}
    </div>
  );
}
