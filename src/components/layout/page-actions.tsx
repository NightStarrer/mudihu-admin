import { cn } from "@/lib/utils";

/**
 * Stacks action buttons full-width on mobile; inline on sm+.
 * Use with Button or Link + buttonVariants children.
 */
export function PageActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center",
        "[&_a]:inline-flex [&_a]:min-h-10 [&_a]:w-full [&_a]:items-center [&_a]:justify-center sm:[&_a]:w-auto",
        "[&_button]:min-h-10 [&_button]:w-full sm:[&_button]:w-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
