import { type WeeklyRoutine } from "@/lib/student-routines"

export function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0")
  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

export function parseRestTime(restString: string): number {
  const cleanRest = restString.toLowerCase().replace(/\s/g, "")

  if (cleanRest.includes("min")) {
    const minutes = Number.parseFloat(cleanRest.replace(/[^0-9.-]/g, ""))
    return Math.floor(minutes * 60)
  } else if (cleanRest.includes("s")) {
    return Number.parseInt(cleanRest.replace(/[^0-9]/g, ""))
  } else {
    const num = Number.parseInt(cleanRest.replace(/[^0-9]/g, ""))
    return isNaN(num) ? 120 : num
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function getCurrentDay(): string {
  const today = new Date()
  const dayIndex = today.getDay() // 0 = domingo, 1 = lunes, etc.
  const dayMapping = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"]
  return dayMapping[dayIndex]
}

export function getFirstRoutineId(weeklyRoutine: WeeklyRoutine | null | undefined): string | null {
  for (const dayKey in weeklyRoutine) {
    const dayRoutine = weeklyRoutine?.[dayKey as keyof WeeklyRoutine]
    if (dayRoutine && dayRoutine.routine_id) {
      return dayRoutine.routine_id
    }
  }
  return null
}