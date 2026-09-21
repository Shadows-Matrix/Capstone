import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Wrench,
  Zap,
  Refrigerator,
  Paintbrush,
  Hammer,
  Leaf,
  AirVent,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Wrench,
  Zap,
  Refrigerator,
  Paintbrush,
  Hammer,
  Leaf,
  AirVent,
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Wrench;
  return <Icon className={className} />;
}
