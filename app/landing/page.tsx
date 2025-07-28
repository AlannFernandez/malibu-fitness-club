"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    CheckCircle,
    Smartphone,
    Users,
    BarChart3,
    Bell,
    Target,
    Star,
    Play,
    ArrowRight,
    Menu,
    X,
    Dumbbell,
    TrendingUp,
    Shield,
    Zap,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const features = [
        {
            icon: <Dumbbell className="h-8 w-8 text-blue-600" />,
            title: "Rutinas Personalizadas",
            description:
                "Crea y asigna rutinas específicas para cada estudiante con ejercicios detallados y seguimiento en tiempo real.",
        },
        {
            icon: <BarChart3 className="h-8 w-8 text-green-600" />,
            title: "Análisis de Progreso",
            description: "Visualiza el progreso de tus estudiantes con gráficos detallados y reportes exportables.",
        },
        {
            icon: <Users className="h-8 w-8 text-purple-600" />,
            title: "Gestión de Estudiantes",
            description: "Administra fácilmente la información de todos tus estudiantes y sus membresías.",
        },
        {
            icon: <Bell className="h-8 w-8 text-orange-600" />,
            title: "Notificaciones Inteligentes",
            description: "Mantén a tus estudiantes motivados con recordatorios automáticos y notificaciones push.",
        },
        {
            icon: <Smartphone className="h-8 w-8 text-pink-600" />,
            title: "App Móvil PWA",
            description: "Funciona como una app nativa en cualquier dispositivo, incluso sin conexión a internet.",
        },
        {
            icon: <Target className="h-8 w-8 text-red-600" />,
            title: "Sistema de Metas",
            description: "Establece objetivos claros y trackea el cumplimiento de metas de cada estudiante.",
        },
    ]

    const testimonials = [
        {
            name: "Carlos Mendoza",
            role: "Entrenador Personal",
            image: "/placeholder.svg?height=60&width=60",
            content:
                "Esta app revolucionó mi forma de trabajar. Ahora puedo dar seguimiento a 50+ estudiantes de manera eficiente y profesional.",
            rating: 5,
        },
        {
            name: "María González",
            role: "Dueña de Gimnasio",
            image: "/placeholder.svg?height=60&width=60",
            content:
                "Increíble cómo mejoró la retención de clientes. Los estudiantes se sienten más comprometidos con sus rutinas.",
            rating: 5,
        },
        {
            name: "Roberto Silva",
            role: "Fitness Coach",
            image: "/placeholder.svg?height=60&width=60",
            content:
                "Los reportes automáticos me ahorran horas de trabajo. Puedo enfocarme en lo que realmente importa: entrenar.",
            rating: 5,
        },
    ]

    const pricingPlans = [
        {
            name: "Starter",
            price: "$29",
            period: "/mes",
            description: "Perfecto para entrenadores independientes",
            features: [
                "Hasta 25 estudiantes",
                "Rutinas ilimitadas",
                "Reportes básicos",
                "Notificaciones push",
                "Soporte por email",
            ],
            popular: false,
        },
        {
            name: "Professional",
            price: "$59",
            period: "/mes",
            description: "Ideal para gimnasios pequeños y medianos",
            features: [
                "Hasta 100 estudiantes",
                "Rutinas ilimitadas",
                "Reportes avanzados",
                "Notificaciones push",
                "Sistema de metas",
                "Soporte prioritario",
                "Exportación de datos",
            ],
            popular: true,
        },
        {
            name: "Enterprise",
            price: "$99",
            period: "/mes",
            description: "Para cadenas de gimnasios y grandes centros",
            features: [
                "Estudiantes ilimitados",
                "Múltiples entrenadores",
                "Reportes personalizados",
                "API completa",
                "Integración con sistemas",
                "Soporte 24/7",
                "Onboarding personalizado",
            ],
            popular: false,
        },
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Dumbbell className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">GymPro</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                    Características
                                </a>
                                <a href="#testimonials" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                    Testimonios
                                </a>
                                <a href="#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                    Precios
                                </a>
                                <Link href="/app">
                                    <Button variant="outline" className="ml-4 bg-transparent">
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                                <Link href="/app">
                                    <Button className="bg-blue-600 hover:bg-blue-700">Prueba Gratis</Button>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                            <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600">
                                Características
                            </a>
                            <a
                                href="#testimonials"
                                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600"
                            >
                                Testimonios
                            </a>
                            <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600">
                                Precios
                            </a>
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <Link href="/app">
                                    <Button variant="outline" className="w-full mb-2 bg-transparent">
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                                <Link href="/app">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Prueba Gratis</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
                                <Zap className="h-4 w-4 mr-1" />
                                Nuevo: Sistema de Metas Inteligente
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                                Transforma tu
                                <span className="text-blue-600"> Gimnasio </span>
                                con Tecnología
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                La plataforma completa para entrenadores y gimnasios que quieren ofrecer una experiencia excepcional a
                                sus estudiantes. Gestiona rutinas, trackea progreso y mantén a tus clientes motivados.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/app">
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                                        Comenzar Prueba Gratis
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                                    <Play className="mr-2 h-5 w-5" />
                                    Ver Demo
                                </Button>
                            </div>
                            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    14 días gratis
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Sin tarjeta de crédito
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Soporte 24/7
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl p-4">
                                <img
                                    src="/placeholder.svg?height=600&width=400&text=GymPro Dashboard - Rutinas personalizadas para cada estudiante"
                                    alt="GymPro Dashboard"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white p-3 rounded-full shadow-lg">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
                            <div className="text-gray-600">Gimnasios Activos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">25K+</div>
                            <div className="text-gray-600">Estudiantes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">1M+</div>
                            <div className="text-gray-600">Rutinas Completadas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">98%</div>
                            <div className="text-gray-600">Satisfacción</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Todo lo que necesitas en una sola plataforma
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Desde la creación de rutinas hasta el análisis de resultados, GymPro te da todas las herramientas para
                            hacer crecer tu negocio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <div className="mb-4">{feature.icon}</div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Screenshots Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ve GymPro en acción</h2>
                        <p className="text-xl text-gray-600">Interfaz intuitiva diseñada para entrenadores y estudiantes</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <img
                                src="/placeholder.svg?height=400&width=300&text=Rutinas Personalizadas - Vista móvil con ejercicios del día"
                                alt="Pantalla de Rutinas"
                                className="w-full rounded-lg shadow-lg"
                            />
                            <h3 className="text-lg font-semibold text-center">Rutinas Personalizadas</h3>
                        </div>
                        <div className="space-y-4">
                            <img
                                src="/placeholder.svg?height=400&width=300&text=Seguimiento de Progreso - Gráficos y estadísticas"
                                alt="Pantalla de Progreso"
                                className="w-full rounded-lg shadow-lg"
                            />
                            <h3 className="text-lg font-semibold text-center">Seguimiento de Progreso</h3>
                        </div>
                        <div className="space-y-4">
                            <img
                                src="/placeholder.svg?height=400&width=300&text=Dashboard del Entrenador - Gestión completa"
                                alt="Dashboard del Entrenador"
                                className="w-full rounded-lg shadow-lg"
                            />
                            <h3 className="text-lg font-semibold text-center">Dashboard del Entrenador</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
                        <p className="text-xl text-gray-600">Más de 500 gimnasios confían en GymPro</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                                    <div className="flex items-center">
                                        <Avatar className="h-12 w-12 mr-4">
                                            <AvatarImage src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
                                            <AvatarFallback>
                                                {testimonial.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                            <div className="text-sm text-gray-600">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planes que se adaptan a tu negocio</h2>
                        <p className="text-xl text-gray-600">Comienza gratis y escala según crezcas</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <Card
                                key={index}
                                className={`relative border-2 ${plan.popular ? "border-blue-500 shadow-xl" : "border-gray-200"}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-blue-500 text-white px-4 py-1">Más Popular</Badge>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-8">
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-gray-600">{plan.period}</span>
                                    </div>
                                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                                <span className="text-gray-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/app">
                                        <Button
                                            className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"}`}
                                            size="lg"
                                        >
                                            Comenzar Ahora
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">¿Necesitas algo personalizado?</p>
                        <Button variant="outline" size="lg">
                            Contactar Ventas
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para transformar tu gimnasio?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Únete a más de 500 gimnasios que ya están usando GymPro para hacer crecer su negocio y mantener a sus
                        clientes felices.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/app">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                                Comenzar Prueba Gratis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3 bg-transparent"
                        >
                            Agendar Demo
                        </Button>
                    </div>
                    <p className="text-blue-100 text-sm mt-4">14 días gratis • Sin tarjeta de crédito • Soporte incluido</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Dumbbell className="h-8 w-8 text-blue-400" />
                                <span className="ml-2 text-xl font-bold">GymPro</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                La plataforma completa para gestionar tu gimnasio y mantener a tus estudiantes motivados.
                            </p>
                            <div className="flex space-x-4">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-400">Datos seguros y encriptados</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Producto</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#features" className="hover:text-white">
                                        Características
                                    </a>
                                </li>
                                <li>
                                    <a href="#pricing" className="hover:text-white">
                                        Precios
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        API
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Integraciones
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Centro de Ayuda
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Contacto
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Estado del Sistema
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Comunidad
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Acerca de
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Carreras
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white">
                                        Privacidad
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">© 2024 GymPro. Todos los derechos reservados.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white text-sm">
                                Términos
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm">
                                Privacidad
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
