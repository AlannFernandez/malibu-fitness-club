import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const goalTypeMap: Record<string,string>={
    weight_loss: "Pérdida de peso",
    muscle_gain: "Ganancia Muscular",
    weight_gain: "Aumento de Peso",
    strength: "Fuerza",
    endurance: "Resistencia",
    other: "Otro"
}

export function getDayWeek(date: string): string {
  const dateParse = new Date(date)
  return daysOfWeek[dateParse.getDay()].key
}

export const daysOfWeek = [
  {key: 'lunes', sort: 'Lun'},
  {key: 'martes', sort: 'Mar'},
  {key: 'miercoles', sort: 'Mié'},
  {key: 'jueves', sort: 'Jue'},
  {key: 'viernes', sort: 'Vie'},
  {key: 'sabado', sort: 'Sáb'},
  {key: 'domingo', sort: 'Dom'}
]