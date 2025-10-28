import  React, {useEffect} from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gym App - Rutinas de Entrenamiento",
  description: "Aplicación para gestionar rutinas de entrenamiento y seguimiento de progreso",
  manifest: "/manifest.json",
  keywords: ["gym", "fitness", "rutinas", "entrenamiento", "ejercicios"],
  authors: [{ name: "Gym App Team" }],
  creator: "Gym App",
  publisher: "Gym App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/ios/16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/ios/32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/android/android-launchericon-192-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/ios/180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gym App",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  // Solución de emergencia para el problema de carga infinita
  useEffect(() => {
    // Desregistrar cualquier Service Worker existente
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Service Worker desregistrado');
        }
      });

      // Limpiar todas las caches
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
            console.log(`Cache ${cacheName} eliminada`);
          });
        });
      }
    }
    
    // Solución para el problema de carga infinita
    const handleBeforeUnload = () => {
      // Limpiar el estado de la sesión al recargar
      sessionStorage.removeItem('loadingState');
    };
    
    // Verificar si estamos en un bucle de carga
    const loadingAttempts = parseInt(sessionStorage.getItem('loadingAttempts') || '0');
    if (loadingAttempts > 3) {
      // Resetear el contador después de 3 intentos
      sessionStorage.removeItem('loadingAttempts');
      // Forzar una recarga limpia
      window.location.reload();
    } else {
      // Incrementar el contador de intentos
      sessionStorage.setItem('loadingAttempts', (loadingAttempts + 1).toString());
      // Establecer un timeout para resetear el contador
      setTimeout(() => {
        sessionStorage.removeItem('loadingAttempts');
      }, 5000);
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  return (
      <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/ios/180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gym App" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
      {children}
      <Analytics />
      
      </body>
      </html>
  )
}
