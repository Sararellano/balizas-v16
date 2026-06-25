import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Balizas V16 España | Mapa en tiempo real",
  description:
    "Mapa interactivo de balizas V16 activas en España con datos oficiales DATEX2 de la DGT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
