import clsx from "clsx";
import { FaTimes } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import TopButton from "../TopButton";

interface ModalListEditorProps {
  editMode: boolean;
  editAble: boolean;
  onClose: () => void;
  onDelete: () => void;
  leftButtons?: React.ReactNode;
  rightButtons?: React.ReactNode;
}

export default function ModalListEditor({
  editMode,
  editAble,
  onClose,
  onDelete,
  leftButtons,
  rightButtons,
}: ModalListEditorProps) {
  return (
    <div
      className={clsx("fixed top-0 left-0 w-full z-[51]", {
        "-translate-y-full": editMode,
        "translate-y-0": !editMode,
      })}
    >
      <div className="flex items-center justify-between w-full p-4 bg-slate-200 text-slate-700">
        <div className="flex items-center justify-start flex-1 gap-2">
          <TopButton icon={FaTimes} onClick={() => onClose()} />
          {leftButtons}
        </div>
        <div className="flex items-center justify-end flex-1 gap-2">
          {rightButtons}
          <TopButton
            icon={FaTrash}
            color={editAble ? "#a80f0f" : "#a6a6a6cc"}
            onClick={() => {
              onDelete();
            }}
          />
        </div>
      </div>
    </div>
  );
}
