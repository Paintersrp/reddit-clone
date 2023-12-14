import { type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SideCardProps {
  children: ReactNode;
  className?: string;
  mobileHide?: boolean;
}

const SideCard: FC<SideCardProps> = ({
  children,
  className,
  mobileHide = true,
}) => {
  return (
    <div
      className={cn(
        "overflow-hidden h-fit sm:rounded-lg border border-gray-200",
        mobileHide ? "hidden sm:block" : "",
        className
      )}
    >
      {children}
    </div>
  );
};

type SideCardContentProps = SideCardProps;

const SideCardContent: FC<SideCardContentProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "-my-3 px-4 py-4 md:px-4 md:py-4 text-sm leading-6",
        className
      )}
    >
      {children}
    </div>
  );
};

type SideCardHeaderProps = SideCardProps & { innerClass?: string };

const SideCardHeader: FC<SideCardHeaderProps> = ({
  children,
  className,
  innerClass,
}) => {
  return (
    <div
      className={cn(
        "bg-emerald-100 px-2 sm:px-3 sm:py-1 md:px-4 md:py-2",
        className
      )}
    >
      <div
        className={cn(
          "font-semibold py-2 sm:py-3 flex items-center gap-1.5",
          innerClass
        )}
      >
        {children}
      </div>
    </div>
  );
};

export { SideCard, SideCardContent, SideCardHeader };
