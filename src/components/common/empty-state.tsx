import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <Icon className="size-10 text-muted-foreground/50" />
      <p className="font-medium">{title}</p>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
      {children}
    </div>
  );
}