import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgroRed Uy - Conectamos el campo uruguayo",
  description: "La red que une productores agropecuarios y contratistas de forma rápida, confiable y geolocalizada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontWeight: '500',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              duration: 4000,
              style: {
                background: '#10B981',
                color: '#fff',
                fontWeight: '500',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: '#fff',
                fontWeight: '500',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              },
            },
          }}
        />
      </body>
    </html>
  );
}
