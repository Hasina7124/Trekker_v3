"use client"

import { Progress } from "@/components/ui/progress"
import { Trophy, Star } from "lucide-react"

interface ProgressTrackerProps {
  progress: number
  earnedXP: number
  totalXP: number
  completedModules: number
  totalModules: number
}

export function ProgressTracker({ progress, earnedXP, totalXP, completedModules, totalModules }: ProgressTrackerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-white">Progression du projet</span>
        </div>
        <span className="text-sm font-medium text-white">{progress}%</span>
      </div>

      <Progress value={progress} className="h-2 bg-slate-700">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </Progress>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-500/20 p-1.5">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-slate-400">XP Gagnés</div>
              <div className="text-sm font-semibold text-white">
                {earnedXP} / {totalXP}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-500/20 p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-emerald-500"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-400">Modules Complétés</div>
              <div className="text-sm font-semibold text-white">
                {completedModules} / {totalModules}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
