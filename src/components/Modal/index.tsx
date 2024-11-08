import { FaTimes } from "react-icons/fa";
import ModalPortal from "./ModalPortal";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
}

export default function Modal({
  children,
  open,
  onClose,
  title = "설정",
}: ModalProps) {
  if (!open) return null;
  return (
    <ModalPortal>
      {/* 화면 전체를 덮는 모달 배경 */}
      <button className="fixed inset-0 bg-black/80 z-40" onClick={onClose} />
      {/* 모달 컨테이너 */}
      <div className="fixed max-w-[calc(100vw-32px)] rounded-lg w-fit min-w-[320px] max-h-[calc(100vh-32px)] h-fit min-h-[200px] m-auto inset-0 flex flex-col justify-center items-center z-50 bg-white text-black">
        <div className="w-full flex justify-between p-4">
          <div className="text-2xl font-bold">{title}</div>
          <button onClick={onClose}>
            <FaTimes size={24} />
          </button>
        </div>
        <div className="w-full flex-1 p-2">{children}</div>
      </div>
    </ModalPortal>
  );
}
