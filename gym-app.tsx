"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth"
import LoginScreen from "./components/login-screen"
import RoutinesScreen from "./components/routines-screen"
import AccessDeniedScreen from "./components/access-denied-screen"
import TeacherDashboard from "./components/teacher-dashboard"
import ExerciseCreator from "./components/exercise-creator"
import RoutineBuilder from "./components/routine-builder"
import StudentManager from "./components/student-manager"

type UserStatus = "loading" | "logged-out" | "logged-in-active" | "logged-in-expired"
type UserRole = "student" | "teacher" | "admin"
type TeacherView = "dashboard" | "create-exercise" | "build-routine" | "manage-students"

interface UserData {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  avatar_url?: string
}

export default function GymApp() {
  const [userStatus, setUserStatus] = useState<UserStatus>("loading")
  const [userData, setUserData] = useState<UserData | null>(null);
  const [teacherView, setTeacherView] = useState<TeacherView>("dashboard")

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const verifySession = async () => {
      try {
        // Establecer un tiempo máximo para la carga
        const timeoutPromise = new Promise<void>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Timeout al verificar la sesión"));
          }, 5000); // 5 segundos máximo para cargar
        });

        // Intentar obtener los datos del usuario con un límite de tiempo
        const userPromise = authService.getCurrentUser();
        
        // Usar Promise.race para limitar el tiempo de espera
        const { user, userData: currentUserData } = await Promise.race([
          userPromise,
          timeoutPromise.then(() => ({ user: null, userData: null }))
        ]) as any;

        clearTimeout(timeoutId);
        if (!isMounted) return;

        if (user && currentUserData) {
          setUserData(currentUserData);

          if (currentUserData.role === "student") {
            try {
              const membershipStatus = await Promise.race([
                authService.checkMembershipStatus(user.id),
                new Promise<string>((_, reject) => {
                  setTimeout(() => reject(new Error("Timeout al verificar membresía")), 3000);
                })
              ]);
              
              if (!isMounted) return;
              setUserStatus(membershipStatus === "active" ? "logged-in-active" : "logged-in-expired");
            } catch (error) {
              console.error("Error o timeout al verificar membresía:", error);
              if (isMounted) setUserStatus("logged-in-active"); // Asumimos activo por defecto
            }
          } else {
            setUserStatus("logged-in-active");
          }
        } else {
          setUserStatus("logged-out");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) setUserStatus("logged-out");
      }
    };

    // Añadir un pequeño retraso antes de verificar la sesión
    setTimeout(() => {
      if (isMounted) verifySession();
    }, 500);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        await verifySession();
      } else if (event === "SIGNED_OUT") {
        setUserStatus("logged-out");
        setUserData(null);
        setTeacherView("dashboard");
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const checkCurrentSession = async () => {
    try {
      const { user, userData: currentUserData } = await authService.getCurrentUser()

      if (user && currentUserData) {
        setUserData(currentUserData)

        // Verificar membresía solo para estudiantes
        if (currentUserData.role === "student") {
          const membershipStatus = await authService.checkMembershipStatus(user.id)
          setUserStatus(membershipStatus === "active" ? "logged-in-active" : "logged-in-expired")
        } else {
          setUserStatus("logged-in-active")
        }
      } else {
        setUserStatus("logged-out")
      }
    } catch (error) {
      console.error("Error checking session:", error)
      setUserStatus("logged-out")
    }
  }

  const handleAuthStateChange = async (userId: string) => {
    try {
      const { user, userData: currentUserData } = await authService.getCurrentUser()

      if (user && currentUserData) {
        setUserData(currentUserData)

        if (currentUserData.role === "student") {
          const membershipStatus = await authService.checkMembershipStatus(user.id)
          setUserStatus(membershipStatus === "active" ? "logged-in-active" : "logged-in-expired")
        } else {
          setUserStatus("logged-in-active")
        }
      }
    } catch (error) {
      console.error("Error handling auth state change:", error)
      setUserStatus("logged-out")
    }
  }

  const handleLogin = (membershipActive: boolean, email: string, loginUserData: UserData) => {
    setUserData(loginUserData)
    setUserStatus(membershipActive ? "logged-in-active" : "logged-in-expired")
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      setUserStatus("logged-out")
      setUserData(null)
      // setTeacherView("dashboard")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleRenewMembership = () => {
    setUserStatus("logged-in-active")
  }

  // Loading state
  if (userStatus === "loading") {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>
    )
  }

  if (userStatus === "logged-out") {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (userStatus === "logged-in-expired") {
    return <AccessDeniedScreen onRenew={handleRenewMembership} onLogout={handleLogout} />
  }

  // Pantallas para profesores (escritorio)
  if (userData?.role === "teacher" || userData?.role === "admin") {
    if (teacherView === "create-exercise") {
      return <ExerciseCreator onBack={() => setTeacherView("dashboard")} onLogout={handleLogout} userData={userData} />
    }

    if (teacherView === "build-routine") {
      return <RoutineBuilder onBack={() => setTeacherView("dashboard")} onLogout={handleLogout} userData={userData} />
    }

    if (teacherView === "manage-students") {
      return <StudentManager onBack={() => setTeacherView("dashboard")} onLogout={handleLogout} userData={userData} />
    }

    return <TeacherDashboard onNavigate={setTeacherView} onLogout={handleLogout} userData={userData} />
  }

  // Pantalla para estudiantes (móvil)
  return <RoutinesScreen onLogout={handleLogout} userData={userData} />
}
