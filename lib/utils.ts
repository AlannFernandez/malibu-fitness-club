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
