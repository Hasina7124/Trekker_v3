import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Flag, Map, Scroll, Shield, Users } from "lucide-react"

export default function NewProjectPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      // Effet sonore de progression
      playSound("level-up")
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const playSound = (type: string) => {
    // Ici on pourrait implémenter des effets sonores
    console.log(`Playing sound: ${type}`)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle Quête</h1>
        <p className="text-muted-foreground">Créez une nouvelle mission pour votre équipe</p>
      </div>

      {/* Barre de progression */}
      <div className="relative">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i + 1 === step
                    ? "bg-[#60a5fa] text-white"
                    : i + 1 < step
                      ? "bg-[#34d399] text-white"
                      : "bg-[#334155] text-muted-foreground"
                }`}
              >
                {i + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : <span>{i + 1}</span>}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">
                {i === 0 && "Informations"}
                {i === 1 && "Objectifs"}
                {i === 2 && "Contraintes"}
                {i === 3 && "Équipe"}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-[#334155] rounded-full">
          <div
            className="h-full bg-[#60a5fa] rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Formulaire par étapes */}
      <Card className="bg-[#1e293b] border-[#334155]">
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-[#60a5fa] flex items-center justify-center">
                  <Scroll className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Informations de base</h2>
                  <p className="text-sm text-muted-foreground">Définissez votre quête</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la quête</Label>
                  <Input id="name" placeholder="Ex: Projet Avalanche" className="bg-[#0f172a] border-[#334155]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre projet en quelques lignes..."
                    className="min-h-[120px] bg-[#0f172a] border-[#334155]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-[#60a5fa] flex items-center justify-center">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Objectifs principaux</h2>
                  <p className="text-sm text-muted-foreground">Définissez les buts à atteindre</p>
                </div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Label htmlFor={`objective-${i}`}>Objectif {i}</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`objective-${i}`}
                        placeholder={`Objectif ${i}`}
                        className="bg-[#0f172a] border-[#334155]"
                      />
                      <select className="h-10 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md">
                        <option value="required">Obligatoire</option>
                        <option value="optional">Optionnel</option>
                        <option value="bonus">Bonus</option>
                      </select>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-2 border-dashed border-[#334155] text-muted-foreground">
                  + Ajouter un objectif
                </Button>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="success-criteria">Critères de réussite</Label>
                  <Textarea
                    id="success-criteria"
                    placeholder="Quels sont les critères qui détermineront le succès de cette quête ?"
                    className="min-h-[100px] bg-[#0f172a] border-[#334155]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={step === 1} className="border-[#334155]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
            </Button>

            {step < totalSteps ? (
              <Button onClick={nextStep}>
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // Soumission du formulaire
                  playSound("quest-complete")
                  // Redirection vers la liste des projets
                }}
                className="bg-[#34d399] hover:bg-[#10b981]"
              >
                Lancer la quête <Map className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Carte d'aide */}
      <Card className="bg-[#1e293b] border-[#334155]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[#334155] flex items-center justify-center mt-1">
              <Compass className="h-4 w-4 text-[#60a5fa]" />
            </div>
            <div>
              <h3 className="font-medium">Conseil d'aventurier</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {step === 1 && "Donnez un nom évocateur à votre quête pour inspirer votre équipe."}
                {step === 2 && "Définissez des objectifs clairs et mesurables pour garantir le succès de la mission."}
                {step === 3 &&
                  "Soyez précis sur les contraintes techniques pour éviter les surprises en cours de route."}
                {step === 4 &&
                  "Choisissez des membres d'équipe dont les compétences se complètent pour maximiser les chances de réussite."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
