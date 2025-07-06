"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Users, BarChart3, Settings, LogOut, Dumbbell, BookOpen, Target, UserCheck } from "lucide-react"


import { exerciseService } from "@/lib/excercise";
import { userService } from "@/lib/users"

interface TeacherDashboardProps {
  onNavigate: (view: "dashboard" | "create-exercise" | "build-routine" | "manage-students") => void
  onLogout: () => void
}

export default function TeacherDashboard({ onNavigate, onLogout }: TeacherDashboardProps) {
  const [exerciseCount, setExerciseCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [exercises, users] = await Promise.all([
          exerciseService.getExercises(),
          userService.getUsers(),
        ]);

        if (exercises) {
          setExerciseCount(exercises.length);
        }

        if (users) {
          setUsersCount(users.length);
        }

      } catch (err: any) {
        console.error("Error al obtener datos:", err);
        setError(`Error al cargar datos: ${err.message || 'Error desconocido'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel de Profesor</h1>
              <p className="text-gray-400">Gestiona ejercicios, rutinas y estudiantes</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-gray-400 hover:text-red-400 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
    className="bg-blue-800/90 border-blue-700 cursor-pointer hover:bg-blue-700/80 transition-all duration-200 shadow-md"
    onClick={() => onNavigate("create-exercise")}
    >     
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/25 rounded-lg flex items-center justify-center border border-blue-600/30">
              <Plus className="w-6 h-6 text-blue-200" />
            </div>
          <div>
            <CardTitle className="text-white">Crear Ejercicio</CardTitle>
            <p className="text-blue-100/80 text-sm">Añadir nuevo ejercicio</p>
          </div>
        </div>
      </CardHeader>
        <CardContent>
          <p className="text-blue-100/70 text-sm">
            Crea ejercicios personalizados con descripción, series, repeticiones y más.
          </p>
        </CardContent>
      </Card>

          <Card
            className="bg-green-400/75 border-green-700/50 cursor-pointer hover:from-green-800/30 hover:to-green-700/40 transition-all duration-200"
            onClick={() => onNavigate("build-routine")}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-800/50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Construir Rutinas</CardTitle>
                  <p className="text-green-200 text-sm">Asignar ejercicios por día</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Arrastra y suelta ejercicios para crear rutinas semanales personalizadas.
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-purple-600/90 border-purple-700/70 cursor-pointer hover:from-purple-800/60 hover:to-purple-700/40 transition-all duration-200"
            onClick={() => onNavigate("manage-students")}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Gestionar Estudiantes</CardTitle>
                  <p className="text-purple-200 text-sm">Ver progreso y asistencia</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Supervisa el progreso, pagos y asistencia de todos tus estudiantes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-300/80 border-orange-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Reportes</CardTitle>
                  <p className="text-orange-200 text-sm">Análisis y estadísticas</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">Genera reportes detallados de rendimiento y asistencia.</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  {isLoading ? (
                    <p className="text-2xl font-bold text-white">Cargando...</p>
                  ) : error ? (
                    <p className="text-sm text-red-400">Error</p>
                  ) : (
                    <p className="text-2xl font-bold text-white">{exerciseCount}</p>
                  )}
                  <p className="text-gray-400 text-sm">Ejercicios Creados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  {isLoading ? (
                    <p className="text-2xl font-bold text-white">Cargando...</p>
                  ) : error ? (
                    <p className="text-sm text-red-400">Error</p>
                  ) : (
                    <p className="text-2xl font-bold text-white">{usersCount}</p>
                  )}
                  <p className="text-gray-400 text-sm">Estudiantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">45</p>
                  <p className="text-gray-400 text-sm">Rutinas Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">89%</p>
                  <p className="text-gray-400 text-sm">Tasa de Completado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Nuevo ejercicio "Sentadilla Búlgara" creado</p>
                  <p className="text-gray-400 text-xs">Hace 2 horas</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Rutina "Piernas Avanzado" asignada a 8 estudiantes</p>
                  <p className="text-gray-400 text-xs">Hace 4 horas</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">María González completó rutina de hoy</p>
                  <p className="text-gray-400 text-xs">Hace 6 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}