import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdAdd } from "react-icons/md";

const FAB_SIZE = 56;
const EDGE_PADDING = 8;
const DRAG_THRESHOLD = 30;

type Position = { left: number; bottom: number };

const getDefaultPosition = (): Position => {
  if (typeof window === "undefined") {
    return { left: 100, bottom: 80 };
  }
  const isMobile = window.innerWidth < 1024;
  return {
    left: window.innerWidth - FAB_SIZE - (isMobile ? 16 : 24),
    bottom: isMobile ? 80 : 24,
  };
};

const loadPosition = (storageKey: string): Position | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Position;
    if (typeof parsed?.left === "number" && typeof parsed?.bottom === "number") {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
};

const savePosition = (storageKey: string, pos: Position) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(pos));
  } catch {
    // ignore
  }
};

const clampPosition = (pos: Position): Position => {
  if (typeof window === "undefined") return pos;
  const maxLeft = window.innerWidth - FAB_SIZE - EDGE_PADDING;
  const maxBottom = window.innerHeight - FAB_SIZE - EDGE_PADDING;
  return {
    left: Math.max(EDGE_PADDING, Math.min(maxLeft, pos.left)),
    bottom: Math.max(EDGE_PADDING, Math.min(maxBottom, pos.bottom)),
  };
};

type Props = {
  onClick: () => void;
  ariaLabel?: string;
  icon?: React.ReactNode;
  draggable?: boolean;
  storageKey?: string;
  className?: string;
};

const ATMFab = ({
  onClick,
  ariaLabel = "Add",
  icon,
  draggable = true,
  storageKey,
  className = "",
}: Props) => {
  const defaultPos = getDefaultPosition();
  const savedPos = storageKey ? loadPosition(storageKey) : null;
  const [position, setPosition] = useState<Position>(
    savedPos ? clampPosition(savedPos) : defaultPos
  );
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; left: number; bottom: number } | null>(null);
  const hasMovedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Re-clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((p) => clampPosition(p));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable) return;
      e.preventDefault();
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        left: position.left,
        bottom: position.bottom,
      };
      hasMovedRef.current = false;
      setIsDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [draggable, position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current || !draggable) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = dragStartRef.current.y - e.clientY; // Y inverted for bottom
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        hasMovedRef.current = true;
      }
      const newPos = clampPosition({
        left: dragStartRef.current.left + dx,
        bottom: dragStartRef.current.bottom + dy,
      });

      // Direct DOM update for smooth 60fps drag - no React re-renders
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.left = `${newPos.left}px`;
          containerRef.current.style.bottom = `${newPos.bottom}px`;
        }
        rafRef.current = null;
      });
    },
    [draggable]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore if not captured */
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (dragStartRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPos = clampPosition({
          left: rect.left,
          bottom: window.innerHeight - rect.bottom,
        });
        setPosition(newPos);
        if (storageKey) savePosition(storageKey, newPos);
      }
      const wasDrag = hasMovedRef.current;
      dragStartRef.current = null;
      setIsDragging(false);
      // Fire click only when it wasn't a drag (pointer capture was blocking click event)
      if (!wasDrag) {
        onClick();
      }
    },
    [storageKey, onClick]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (hasMovedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        hasMovedRef.current = false;
      }
    },
    []
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`fixed z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-main)] shadow-lg shadow-slate-400/25 transition-all duration-200 hover:scale-110 hover:bg-[var(--primary-hover)] hover:shadow-xl select-none touch-none ${draggable ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer"} ${className}`}
      style={{
        left: position.left,
        bottom: position.bottom,
        willChange: isDragging ? "left, bottom" : undefined,
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex h-full w-full items-center justify-center rounded-full text-white transition-all duration-200 active:scale-95"
        aria-label={ariaLabel}
      >
        {icon ?? <MdAdd className="text-3xl font-bold" />}
      </button>
    </div>
  );
};

export default ATMFab;
