import type { Metadata } from "next";
import { Outfit, Righteous } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { AlertProvider } from "@/components/AlertModal";
import { GoogleOAuthProvider } from '@react-oauth/google';

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
  title: "DispatchR",
  description: "Automated Email Reporter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${righteous.variable}`} data-scroll-behavior="smooth">
      <body className={outfit.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AlertProvider>
            {children}
          </AlertProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
