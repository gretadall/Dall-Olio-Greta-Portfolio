"use client";

import { useEffect, useRef, useState } from "react";
import { useEditMode } from "./EditModeProvider";
import {
  updateHomeLayoutPosition,
  resetHomeLayoutPosition,
  type HomeLayoutTarget,
} from "@/app/edit/actions";

const LIMIT = 150;
const SNAP_PX = 8;

type DragState = {
  startX: number;
  startY: number;
  baseX: number;
  baseY: number;
  canvasRect: DOMRect;
  naturalCenterX: number;
  naturalCenterY: number;
};

export function Positionable({
  slotKey,
  target,
  position,
  children,
  className,
  canvasClass = "square-canvas",
}: {
  slotKey: string;
  target: HomeLayoutTarget;
  position: { x: number; y: number } | null;
  children: React.ReactNode;
  className?: string;
  canvasClass?: string;
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
  const dragState = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [guides, setGuides] = useState({ v: false, h: false });
  const [dragCanvasRect, setDragCanvasRect] = useState<DOMRect | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(
    null
  );

  useEffect(() => {
    function measure() {
      const canvas = ref.current?.closest(`.${canvasClass}`) as HTMLElement | null;
      if (!canvas) return;
      setCanvasSize({ w: canvas.clientWidth, h: canvas.clientHeight });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [canvasClass]);

  // Positions are stored as a percentage of the canvas (the square/grid the
  // element lives in), but CSS `translate(%)` is relative to the element's
  // OWN size — so we convert to pixels here rather than passing the raw
  // percentage straight into the transform.
  const pxX = canvasSize ? (pos.x / 100) * canvasSize.w : 0;
  const pxY = canvasSize ? (pos.y / 100) * canvasSize.h : 0;
  const style = {
    "--pos-x": `${pxX}px`,
    "--pos-y": `${pxY}px`,
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
    const canvas = el?.closest(`.${canvasClass}`) as HTMLElement | null;
    if (!el || !canvas) return;

    const elRect = el.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const naturalCenterX =
      elRect.left + elRect.width / 2 - (pos.x / 100) * canvasRect.width;
    const naturalCenterY =
      elRect.top + elRect.height / 2 - (pos.y / 100) * canvasRect.height;

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: pos.x,
      baseY: pos.y,
      canvasRect,
      naturalCenterX,
      naturalCenterY,
    };
    setDragCanvasRect(canvasRect);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onHandlePointerMove(e: React.PointerEvent) {
    const state = dragState.current;
    if (!state) return;

    let nextX = clamp(
      state.baseX + ((e.clientX - state.startX) / state.canvasRect.width) * 100
    );
    let nextY = clamp(
      state.baseY + ((e.clientY - state.startY) / state.canvasRect.height) * 100
    );

    const canvasCenterX = state.canvasRect.left + state.canvasRect.width / 2;
    const canvasCenterY = state.canvasRect.top + state.canvasRect.height / 2;
    const centerX = state.naturalCenterX + (nextX / 100) * state.canvasRect.width;
    const centerY = state.naturalCenterY + (nextY / 100) * state.canvasRect.height;

    const snapV = Math.abs(centerX - canvasCenterX) < SNAP_PX;
    const snapH = Math.abs(centerY - canvasCenterY) < SNAP_PX;
    if (snapV) {
      nextX = clamp(
        nextX - ((centerX - canvasCenterX) / state.canvasRect.width) * 100
      );
    }
    if (snapH) {
      nextY = clamp(
        nextY - ((centerY - canvasCenterY) / state.canvasRect.height) * 100
      );
    }

    setGuides({ v: snapV, h: snapH });
    setPos({ x: nextX, y: nextY });
  }

  function onHandlePointerUp() {
    if (!dragState.current) return;
    dragState.current = null;
    setDragging(false);
    setGuides({ v: false, h: false });
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
      {dragging && dragCanvasRect && guides.v && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: dragCanvasRect.left + dragCanvasRect.width / 2,
            top: dragCanvasRect.top,
            width: 1,
            height: dragCanvasRect.height,
            background: "#ef4444",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
      {dragging && dragCanvasRect && guides.h && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: dragCanvasRect.left,
            top: dragCanvasRect.top + dragCanvasRect.height / 2,
            width: dragCanvasRect.width,
            height: 1,
            background: "#ef4444",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
