import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-slate-700 rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          value < 30 && "bg-[#f87171]",
          value >= 30 && value < 70 && "bg-[#fbbf24]",
          value >= 70 && "bg-[#34d399]",
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
