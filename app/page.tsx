import GymApp from "../gym-app"
import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando aplicación...</p>
        </div>
      </div>
    }>
      <GymApp />
    </Suspense>
  )
}
