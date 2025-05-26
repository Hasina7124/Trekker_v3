import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        status === "pending" && "bg-blue-500/20 text-[#60a5fa]",
        status === "in_progress" && "bg-green-500/20 text-[#34d399]",
        status === "to_estimate" && "bg-yellow-500/20 text-[#fbbf24]",
        status === "rejected" && "bg-red-500/20 text-[#f87171]",
        className,
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full mr-1",
          status === "pending" && "bg-[#60a5fa]",
          status === "in_progress" && "bg-[#34d399]",
          status === "to_estimate" && "bg-[#fbbf24]",
          status === "rejected" && "bg-[#f87171]",
        )}
      />
      {status === "pending" && "Pending"}
      {status === "in_progress" && "In Progress"}
      {status === "to_estimate" && "To Estimate"}
      {status === "rejected" && "Rejected"}
    </div>
  )
}
