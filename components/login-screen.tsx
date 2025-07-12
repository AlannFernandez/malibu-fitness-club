"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react"
import { authService } from "@/lib/auth"
import PWAInstallPrompt from "./pwa-install-prompt"

interface LoginScreenProps {
  onLogin: (membershipActive: boolean, email: string, userData: any) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        // Registro
        await authService.signUp(email, password, firstName, lastName)
        setError("Registro exitoso! Revisa tu email para confirmar tu cuenta.")
        setIsSignUp(false)
      } else {
        // Login
        const { user, userData } = await authService.signIn(email, password)

        if (user && userData) {
          // Mostrar prompt de instalación después del login exitoso
          setShowInstallPrompt(true)

          // Verificar estado de membresía solo para estudiantes
          let membershipActive = true
          if (userData.role === "student") {
            const membershipStatus = await authService.checkMembershipStatus(user.id)
            membershipActive = membershipStatus === "active"
          }

          onLogin(membershipActive, email, userData)
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setError(error.message || "Error en la autenticación")
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Malibu Fitness</h1>
            <p className="text-gray-400 mt-2">{isSignUp ? "Crea tu cuenta" : "Inicia sesión para continuar"}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
                <Alert
                    className={`${error.includes("exitoso") ? "border-green-600 bg-green-900/20" : "border-red-600 bg-red-900/20"}`}
                >
                  <AlertDescription className={error.includes("exitoso") ? "text-green-400" : "text-red-400"}>
                    {error}
                  </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-300">
                        Nombre Completo
                      </Label>
                      <Input
                          id="fullName"
                          type="text"
                          placeholder="Juan Pérez"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                          required={isSignUp}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">
                        Apellido
                      </Label>
                      <Input
                          id="lastName"
                          type="text"
                          placeholder="Pérez"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                          required={isSignUp}
                      />
                    </div>
                  </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                    required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 pr-10"
                      required
                      minLength={6}
                  />
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                  type="submit"
                  disabled={isLoading || !email || !password || (isSignUp && !firstName)}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 transition-all duration-200"
              >
                {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? "Creando cuenta..." : "Iniciando sesión..."}
                    </>
                ) : isSignUp ? (
                    "Crear Cuenta"
                ) : (
                    "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="space-y-4 text-center">
              <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal">
                ¿Olvidaste tu contraseña?
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-600"></div>
                <span className="text-gray-400 text-sm">o</span>
                <div className="flex-1 h-px bg-gray-600"></div>
              </div>

              <div className="text-gray-400 text-sm">
                {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
                <Button
                    variant="link"
                    className="text-green-400 hover:text-green-300 p-0 h-auto font-normal"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setError(null)
                    }}
                >
                  {isSignUp ? "Iniciar sesión" : "Crear cuenta"}
                </Button>
              </div>
            </div>


          </CardContent>
        </Card>

        {/* PWA Install Prompt - se muestra después del login exitoso */}
        {showInstallPrompt && <PWAInstallPrompt showOnLogin={true} autoShow={false} delay={1000} />}
      </div>
  )
}
