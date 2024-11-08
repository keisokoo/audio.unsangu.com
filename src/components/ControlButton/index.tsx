import clsx from "clsx";
import { IconType } from "react-icons";

interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  color?: string;
  icon: IconType;
  onClick: () => void;
  children?: React.ReactNode;
}

export default function ControlButton({
  onClick,
  icon: Icon,
  size = 48,
  color = "white",
  children,
  className,
  ...props
}: ControlButtonProps) {
  return (
    <button
      className={clsx(
        "p-4 rounded-md relative bg-slate-600 flex items-center justify-center hover:bg-slate-500",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <Icon size={size} color={color} />
      {children}
    </button>
  );
}
