"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Lock, CreditCard, MessageCircle, LogOut, AlertTriangle } from "lucide-react"

interface AccessDeniedScreenProps {
  onRenew: () => void
  onLogout: () => void
}

export default function AccessDeniedScreen({ onRenew, onLogout }: AccessDeniedScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/30">
                <Lock className="w-10 h-10 text-orange-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-2xl font-bold text-white mb-2">Membresía Expirada</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Tu membresía actual ha vencido. Para seguir disfrutando de tus rutinas y todo el contenido de la app, te
            invitamos a renovarla.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Benefits Reminder */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-semibold mb-2 text-sm">Con tu membresía activa tendrás:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Acceso a todas las rutinas personalizadas
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Seguimiento de progreso detallado
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Videos explicativos de ejercicios
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Soporte personalizado
              </li>
            </ul>
          </div>

          {/* Main Action Button */}
          <Button
            onClick={onRenew}
            className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold py-3 transition-all duration-200"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Renovar Membresía
          </Button>

          {/* Secondary Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 bg-transparent"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contactar Soporte
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="text-gray-400 text-sm">o</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>

            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full text-gray-400 hover:text-white hover:bg-gray-700/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              ¿Tienes problemas con el pago?{" "}
              <Button variant="link" className="text-orange-400 hover:text-orange-300 p-0 h-auto text-xs">
                Obtén ayuda aquí
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
