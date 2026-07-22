import type { Metadata } from "next";
import { Outfit, Righteous } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { AlertProvider } from "@/components/AlertModal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AutoReporter",
  description: "Automated Email Reporter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${righteous.variable}`}>
      <body className={outfit.className}>
        <AlertProvider>
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}
