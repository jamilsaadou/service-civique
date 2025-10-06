import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ANSI - Service Civique d'Intégration",
  description: "Plateforme de gestion des affectations du Service Civique d'Intégration - Agence Nationale du Service Civique d'Intégration du Niger",
  icons: {
    icon: [
      {
        url: '/uploads/images/armoirie.png',
        sizes: 'any',
      },
    ],
    apple: '/uploads/images/armoirie.png',
    shortcut: '/uploads/images/armoirie.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
