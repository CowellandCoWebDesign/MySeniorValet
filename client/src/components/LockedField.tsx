import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockedFieldProps {
  /** Whether the underlying value has been revealed */
  revealed: boolean;
  /** Called when the locked field is clicked to request a reveal */
  onReveal: () => void;
  /** Short hint shown over the blurred value */
  label?: string;
  /** The real value to render once revealed (and blurred underneath while locked) */
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps real, authentic content (phone, website, pricing) and blurs it until the
 * user reveals it. The real value is always present in the DOM (never fabricated),
 * just visually obscured — honoring the Golden Data Rule.
 */
export function LockedField({
  revealed,
  onReveal,
  label = "Tap to reveal",
  children,
  className,
}: LockedFieldProps) {
  if (revealed) {
    return <>{children}</>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onReveal();
      }}
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center group cursor-pointer rounded-md",
        className
      )}
      data-testid="button-locked-field"
    >
      <span className="blur-[6px] select-none pointer-events-none opacity-80">
        {children}
      </span>
      <span className="absolute inset-0 flex items-center justify-center gap-1 whitespace-nowrap rounded-md bg-white/40 dark:bg-black/40 text-xs font-semibold text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
        <Lock className="w-3 h-3" />
        {label}
      </span>
    </button>
  );
}
