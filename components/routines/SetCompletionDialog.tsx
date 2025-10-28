"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, X } from "lucide-react"
import { type WeeklyRoutine, type DayRoutine } from "@/lib/student-routines"

type SetCompletionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  routineData: WeeklyRoutine | null
  activeExerciseId: string | null
  currentSetData: { weight: string; reps: string }
  onChangeWeight: (value: string) => void
  onChangeReps: (value: string) => void
  onCompleteSet: () => void
}

export default function SetCompletionDialog({
  open,
  onOpenChange,
  routineData,
  activeExerciseId,
  currentSetData,
  onChangeWeight,
  onChangeReps,
  onCompleteSet,
}: SetCompletionDialogProps) {
  const title = activeExerciseId && routineData
    ? (
      Object.entries(routineData)
        .map(([dayKey, dayRoutine]) => {
          const exercise = dayRoutine.exercises.find((ex: DayRoutine["exercises"][number]) => `${dayKey}-${ex.id}` === activeExerciseId)
          return exercise ? exercise.name : null
        })
        .filter(Boolean)[0] || ""
    )
    : ""

  const restText = routineData && activeExerciseId
    ? (
      Object.entries(routineData)
        .map(([dayKey, dayRoutine]) => {
          const exercise = dayRoutine.exercises.find((ex: DayRoutine["exercises"][number]) => `${dayKey}-${ex.id}` === activeExerciseId)
          return exercise ? exercise.rest : null
        })
        .filter(Boolean)[0] || ""
    )
    : ""

  const canComplete = Boolean(currentSetData.weight && currentSetData.reps)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {title && (
              <>
                {title}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="set-weight" className="text-gray-300">Peso</Label>
              <Input
                id="set-weight"
                type="number"
                placeholder="kg"
                value={currentSetData.weight}
                onChange={(e) => onChangeWeight(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="set-reps" className="text-gray-300">Repeticiones</Label>
              <Input
                id="set-reps"
                type="number"
                placeholder="reps"
                value={currentSetData.reps}
                onChange={(e) => onChangeReps(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
            <p>
              Descanso después de esta serie: {restText || ""}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 bg-transparent"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onCompleteSet}
            className="bg-green-600 hover:bg-green-700"
            disabled={!canComplete}
          >
            <Save className="w-4 h-4 mr-2" />
            Completar Serie
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}