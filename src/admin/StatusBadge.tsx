import { cn } from "@/lib/utils";
import { STATUS_LABELS, type AdminStatus } from "./api";

const STYLES: Record<AdminStatus, string> = {
  new: "bg-accent-subtle text-accent-subtle-foreground",
  contacted: "bg-primary-subtle text-primary-subtle-foreground",
  closed: "bg-muted text-muted-foreground",
};

const StatusBadge = ({ status }: { status: AdminStatus }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      STYLES[status],
    )}
  >
    {STATUS_LABELS[status]}
  </span>
);

export default StatusBadge;
