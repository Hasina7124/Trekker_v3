"use client"

import type { Module } from "@/types"
import { cn } from "@/lib/utils"
import { Lock, CheckCircle, Star, Unlock } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ModuleCardProps {
  module: Module
  status: "locked" | "unlocked" | "completed"
  onClick: () => void
}

export function ModuleCard({ module, status, onClick }: ModuleCardProps) {
  // Styles conditionnels basés sur le statut
  const cardStyles = cn(
    "relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
    status === "completed"
      ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
      : status === "unlocked"
        ? "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
        : "border-slate-700 bg-slate-800/50 hover:bg-slate-700/70",
  )

  // Icône basée sur le statut
  let StatusIcon = Lock
  let iconColor = "text-slate-400"

  if (status === "completed") {
    StatusIcon = CheckCircle
    iconColor = "text-emerald-500"
  } else if (status === "unlocked") {
    StatusIcon = Unlock
    iconColor = "text-amber-500"
  } else if (status === "locked") {
    StatusIcon = Lock
    iconColor = "text-slate-400"
  }

  // Texte du bouton basé sur le statut
  let buttonText = "Voir les détails"
  if (status === "unlocked") {
    buttonText = "Voir les tâches"
  } else if (status === "completed") {
    buttonText = "Voir le récapitulatif"
  }

  return (
    <motion.div
      className={cardStyles}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Effet de particules pour les cartes complétées */}
      {status === "completed" && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4">
          <div className="relative w-24 h-24">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-emerald-500"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.random() * 60 - 30,
                  y: Math.random() * 60 - 30,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{module.title}</h3>
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-500">{module.xp_rewards} XP</span>
          </div>
        </div>
        <div
          className={cn(
            "rounded-full p-1",
            status === "completed" ? "bg-emerald-500/20" : status === "unlocked" ? "bg-amber-500/20" : "bg-slate-700",
          )}
        >
          <StatusIcon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>

      {/* Barre de progression pour les modules complétés */}
      {status === "completed" && (
        <div className="mt-4 h-1.5 w-full rounded-full bg-emerald-950/50 overflow-hidden">
          <div className="h-full w-full bg-emerald-500 rounded-full" />
        </div>
      )}

      {/* Barre de progression pour les modules déverrouillés */}
      {status === "unlocked" && (
        <div className="mt-4 h-1.5 w-full rounded-full bg-amber-950/50 overflow-hidden">
          <div className="h-full w-1/3 bg-amber-500 rounded-full" />
        </div>
      )}

      {/* Effet de verrouillage pour les modules verrouillés */}
      {status === "locked" && (
        <div className="mt-4 h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full w-0 bg-slate-500 rounded-full" />
        </div>
      )}

      {/* Bouton d'action */}
      <div className="mt-4">
        <Button
          onClick={onClick}
          className={cn(
            "w-full",
            status === "completed"
              ? "bg-emerald-500 hover:bg-emerald-600"
              : status === "unlocked"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-slate-700 opacity-50 cursor-not-allowed hover:bg-slate-700"
          )}
          disabled={status === "locked"}
        >
          {buttonText}
        </Button>
      </div>

      {/* Indication du déverrouillage */}
      {status === "unlocked" && (
        <div className="mt-2 text-xs text-slate-400 text-center">Module déverrouillé</div>
      )}
    </motion.div>
  )
}
