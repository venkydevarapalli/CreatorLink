import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "pending" | "accepted" | "rejected" | "active" | "completed" | "in_progress";

const statusStyles: Record<Status, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  accepted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-info/10 text-info border-info/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
};

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  active: "Active",
  completed: "Completed",
  in_progress: "In Progress",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", statusStyles[status])}>
      {statusLabels[status]}
    </Badge>
  );
}
