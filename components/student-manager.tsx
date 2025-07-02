"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Search,
  Users,
  TrendingUp,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  membershipStatus: "active" | "expired" | "pending"
  membershipExpiry: string
  lastPayment: string
  monthlyFee: number
  joinDate: string
  currentRoutine: string
  progress: {
    completedWorkouts: number
    totalWorkouts: number
    streak: number
    lastWorkout: string
  }
  attendance: {
    thisWeek: number
    thisMonth: number
    average: number
  }
  goals: {
    weight: { current: number; target: number; unit: string }
    workoutsPerWeek: { current: number; target: number }
  }
}

interface StudentManagerProps {
  onBack: () => void
  onLogout: () => void
}

const studentsData: Student[] = [
  {
    id: "1",
    name: "María González",
    email: "maria@email.com",
    phone: "+34 666 123 456",
    membershipStatus: "active",
    membershipExpiry: "2024-03-15",
    lastPayment: "2024-02-15",
    monthlyFee: 45,
    joinDate: "2023-08-10",
    currentRoutine: "Rutina Intermedio - Fuerza",
    progress: {
      completedWorkouts: 28,
      totalWorkouts: 32,
      streak: 5,
      lastWorkout: "Hoy",
    },
    attendance: {
      thisWeek: 4,
      thisMonth: 16,
      average: 3.8,
    },
    goals: {
      weight: { current: 65, target: 60, unit: "kg" },
      workoutsPerWeek: { current: 4, target: 4 },
    },
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos@email.com",
    phone: "+34 666 234 567",
    membershipStatus: "active",
    membershipExpiry: "2024-04-20",
    lastPayment: "2024-01-20",
    monthlyFee: 55,
    joinDate: "2023-06-15",
    currentRoutine: "Rutina Avanzado - Hipertrofia",
    progress: {
      completedWorkouts: 45,
      totalWorkouts: 48,
      streak: 12,
      lastWorkout: "Ayer",
    },
    attendance: {
      thisWeek: 5,
      thisMonth: 20,
      average: 4.2,
    },
    goals: {
      weight: { current: 78, target: 82, unit: "kg" },
      workoutsPerWeek: { current: 5, target: 5 },
    },
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana@email.com",
    phone: "+34 666 345 678",
    membershipStatus: "expired",
    membershipExpiry: "2024-01-30",
    lastPayment: "2023-12-30",
    monthlyFee: 40,
    joinDate: "2023-09-05",
    currentRoutine: "Rutina Principiante - Cardio",
    progress: {
      completedWorkouts: 15,
      totalWorkouts: 24,
      streak: 0,
      lastWorkout: "Hace 1 semana",
    },
    attendance: {
      thisWeek: 0,
      thisMonth: 2,
      average: 2.1,
    },
    goals: {
      weight: { current: 70, target: 65, unit: "kg" },
      workoutsPerWeek: { current: 2, target: 3 },
    },
  },
  {
    id: "4",
    name: "Luis Fernández",
    email: "luis@email.com",
    phone: "+34 666 456 789",
    membershipStatus: "pending",
    membershipExpiry: "2024-02-28",
    lastPayment: "2024-01-28",
    monthlyFee: 50,
    joinDate: "2024-01-10",
    currentRoutine: "Rutina Principiante - Fuerza",
    progress: {
      completedWorkouts: 8,
      totalWorkouts: 12,
      streak: 3,
      lastWorkout: "Hace 2 días",
    },
    attendance: {
      thisWeek: 2,
      thisMonth: 8,
      average: 2.5,
    },
    goals: {
      weight: { current: 85, target: 80, unit: "kg" },
      workoutsPerWeek: { current: 3, target: 4 },
    },
  },
  {
    id: "5",
    name: "Sofia López",
    email: "sofia@email.com",
    phone: "+34 666 567 890",
    membershipStatus: "active",
    membershipExpiry: "2024-05-10",
    lastPayment: "2024-02-10",
    monthlyFee: 45,
    joinDate: "2023-11-20",
    currentRoutine: "Rutina Intermedio - Tonificación",
    progress: {
      completedWorkouts: 22,
      totalWorkouts: 28,
      streak: 7,
      lastWorkout: "Hoy",
    },
    attendance: {
      thisWeek: 3,
      thisMonth: 14,
      average: 3.5,
    },
    goals: {
      weight: { current: 58, target: 55, unit: "kg" },
      workoutsPerWeek: { current: 4, target: 4 },
    },
  },
  {
    id: "6",
    name: "Diego Morales",
    email: "diego@email.com",
    phone: "+34 666 678 901",
    membershipStatus: "active",
    membershipExpiry: "2024-03-25",
    lastPayment: "2024-02-25",
    monthlyFee: 60,
    joinDate: "2023-07-08",
    currentRoutine: "Rutina Avanzado - Powerlifting",
    progress: {
      completedWorkouts: 38,
      totalWorkouts: 40,
      streak: 15,
      lastWorkout: "Ayer",
    },
    attendance: {
      thisWeek: 4,
      thisMonth: 18,
      average: 4.5,
    },
    goals: {
      weight: { current: 92, target: 95, unit: "kg" },
      workoutsPerWeek: { current: 5, target: 5 },
    },
  },
]

export default function StudentManager({ onBack, onLogout }: StudentManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "pending">("all")

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.membershipStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600 hover:bg-green-700">Activa</Badge>
      case "expired":
        return <Badge className="bg-red-600 hover:bg-red-700">Expirada</Badge>
      case "pending":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pendiente</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "expired":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const stats = {
    total: studentsData.length,
    active: studentsData.filter((s) => s.membershipStatus === "active").length,
    expired: studentsData.filter((s) => s.membershipStatus === "expired").length,
    pending: studentsData.filter((s) => s.membershipStatus === "pending").length,
    totalRevenue: studentsData.filter((s) => s.membershipStatus === "active").reduce((sum, s) => sum + s.monthlyFee, 0),
    averageAttendance: studentsData.reduce((sum, s) => sum + s.attendance.average, 0) / studentsData.length,
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Estudiantes</h1>
                <p className="text-gray-400">Supervisa progreso, pagos y asistencia</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">{stats.total} estudiantes totales</p>
              <p className="text-sm text-green-400">€{stats.totalRevenue}/mes en ingresos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-gray-400 text-sm">Membresías Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.expired}</p>
                  <p className="text-gray-400 text-sm">Membresías Expiradas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.averageAttendance.toFixed(1)}</p>
                  <p className="text-gray-400 text-sm">Asistencia Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">€{stats.totalRevenue}</p>
                  <p className="text-gray-400 text-sm">Ingresos Mensuales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar estudiantes por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  Todos ({stats.total})
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => setStatusFilter("active")}
                  size="sm"
                  className={statusFilter === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Activos ({stats.active})
                </Button>
                <Button
                  variant={statusFilter === "expired" ? "default" : "outline"}
                  onClick={() => setStatusFilter("expired")}
                  size="sm"
                  className={statusFilter === "expired" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Expirados ({stats.expired})
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  size="sm"
                  className={statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  Pendientes ({stats.pending})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Lista de Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Estudiante</TableHead>
                  <TableHead className="text-gray-300">Estado</TableHead>
                  <TableHead className="text-gray-300">Progreso</TableHead>
                  <TableHead className="text-gray-300">Asistencia</TableHead>
                  <TableHead className="text-gray-300">Último Pago</TableHead>
                  <TableHead className="text-gray-300">Rutina Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{student.name}</p>
                          <p className="text-gray-400 text-sm">{student.email}</p>
                          <p className="text-gray-500 text-xs">{student.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(student.membershipStatus)}
                        {getStatusBadge(student.membershipStatus)}
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        Expira: {new Date(student.membershipExpiry).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(student.progress.completedWorkouts / student.progress.totalWorkouts) * 100}
                            className="flex-1 h-2"
                          />
                          <span className="text-xs text-gray-400">
                            {student.progress.completedWorkouts}/{student.progress.totalWorkouts}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="border-orange-600 text-orange-400">
                            {student.progress.streak} días seguidos
                          </Badge>
                          <span className="text-gray-400">Último: {student.progress.lastWorkout}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-white text-sm">{student.attendance.thisWeek}/7 esta semana</span>
                        </div>
                        <p className="text-gray-400 text-xs">
                          {student.attendance.thisMonth} este mes • Promedio: {student.attendance.average}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-white font-medium">€{student.monthlyFee}/mes</p>
                        <p className="text-gray-400 text-xs">
                          Último: {new Date(student.lastPayment).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {student.currentRoutine}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
