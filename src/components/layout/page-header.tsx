"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="min-w-0"
      >
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </motion.div>
      {action && (
        <div className="w-full shrink-0 sm:w-auto">{action}</div>
      )}
    </motion.header>
  );
}
