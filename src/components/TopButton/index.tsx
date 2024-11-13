import clsx from "clsx";
import { IconType } from "react-icons";

interface TopButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  color?: string;
  icon: IconType;
  onClick: () => void;
  children?: React.ReactNode;
}

export default function TopButton({
  onClick,
  icon: Icon,
  size = 16,
  color = "gray",
  children,
  className,
  ...props
}: TopButtonProps) {
  return (
    <button
      className={clsx(
        "p-2 rounded-md relative flex items-center justify-center",
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
