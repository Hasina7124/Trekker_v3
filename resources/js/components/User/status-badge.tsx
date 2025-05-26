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
        status === "pending" && "bg-yellow-500/20 text-[#fbbf24]",
        status === "active" && "bg-green-500/20 text-[#34d399]",
        status === "rejected" && "bg-red-500/20 text-[#f87171]",
        className,
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full mr-1",
          status === "pending" && "bg-[#fbbf24]",
          status === "active" && "bg-[#34d399]",
          status === "rejected" && "bg-[#f87171]",
        )}
      />
      {status === "pending" && "Pending"}
      {status === "active" && "Active"}
      {status === "rejected" && "Rejected"}
    </div>
  )
}
