import clsx from "clsx";
import { useRef } from "react";

type DefaultItemType = {
  id: string;
  title?: string;
  name?: string;
};
interface ListItemProps<T extends DefaultItemType> {
  item: T;
  onEditMode: (item: T) => void;
  onClick: (item: T) => void;
  selectedMode?: boolean;
  selected?: boolean;
}

const LONG_PRESS_TIME = 1500;

export default function ListItem<T extends DefaultItemType>({
  item,
  onEditMode,
  onClick,
  selectedMode = false,
  selected = false,
}: ListItemProps<T>) {
  const timerRef = useRef<NodeJS.Timeout>();
  const isTouchRef = useRef(false);
  const disableClickEvent = useRef(false);

  const handleTouchStart = () => {
    isTouchRef.current = true;
    if (selectedMode) return;
    timerRef.current = setTimeout(() => {
      disableClickEvent.current = true;
      onEditMode(item);
    }, LONG_PRESS_TIME);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseDown = () => {
    if (isTouchRef.current) {
      isTouchRef.current = false;
      return;
    }
    if (selectedMode) return;

    timerRef.current = setTimeout(() => {
      disableClickEvent.current = true;
      onEditMode(item);
    }, LONG_PRESS_TIME);
  };

  const handleMouseUp = () => {
    if (isTouchRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick = () => {
    if (isTouchRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (disableClickEvent.current) {
      disableClickEvent.current = false;
      return;
    }

    onClick(item);
  };

  return (
    <div
      className="flex flex-row justify-between items-center select-none cursor-pointer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      {" "}
      {selectedMode && (
        <div
          className={clsx("w-4 h-4 rounded-full", {
            "bg-red-500": selected,
            "bg-slate-500": !selected,
          })}
        ></div>
      )}
      <div className="text-xl font-bold px-4 py-2 flex-1">
        {item.title || item.name || "Unknown"}
      </div>
    </div>
  );
}
