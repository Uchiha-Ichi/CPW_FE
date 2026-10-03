"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { BlockCard } from "@/components/admin/page-editor/block-card";
import type { Path } from "@/lib/admin/page-editor/state";
import type { BlockDef, EditorBlock } from "@/lib/admin/page-editor/types";

interface BlockListProps {
  blocks: EditorBlock[];
  defs: ReadonlyMap<string, BlockDef>;
  openIds: ReadonlySet<string>;
  disabled?: boolean;
  onToggle: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, path: Path, value: unknown) => void;
}

export function BlockList({
  blocks,
  defs,
  openIds,
  disabled,
  onToggle,
  onMove,
  onRemove,
  onChange,
}: BlockListProps) {
  const sensors = useSensors(
    // Kéo từ tay kéo; khoảng cách tối thiểu để bấm không bị tính là kéo.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = blocks.map((b) => b.id);

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onMove(from, to);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Để đổi vị trí khối: nhấn phím cách để nhấc, dùng phím mũi tên lên xuống để di chuyển, nhấn phím cách lần nữa để thả, nhấn Esc để hủy.",
        },
        announcements: {
          onDragStart: () => "Đã nhấc khối lên.",
          onDragOver: () => undefined,
          onDragEnd: () => "Đã thả khối vào vị trí mới.",
          onDragCancel: () => "Đã hủy việc di chuyển khối.",
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <SortableBlock
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              def={defs.get(block.type)}
              open={openIds.has(block.id)}
              disabled={disabled}
              onToggle={() => onToggle(block.id)}
              onMove={(delta) => onMove(index, index + delta)}
              onRemove={() => onRemove(block.id)}
              onChange={(path, value) => onChange(block.id, path, value)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableBlockProps {
  block: EditorBlock;
  index: number;
  total: number;
  def: BlockDef | undefined;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onChange: (path: Path, value: unknown) => void;
}

function SortableBlock({ block, ...cardProps }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: cardProps.disabled });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={`Kéo để đổi vị trí khối ${cardProps.index + 1}`}
      disabled={cardProps.disabled}
      className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        // Chỉ dịch chuyển (không co giãn) vì thẻ có chiều cao khác nhau.
        transform: transform
          ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
          : undefined,
        transition,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
        opacity: isDragging ? 0.85 : undefined,
      }}
    >
      <BlockCard block={block} handle={handle} {...cardProps} />
    </div>
  );
}
