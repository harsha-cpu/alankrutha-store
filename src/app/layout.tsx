import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BrandHeader from "@/components/BrandHeader";
import BrandFooter from "@/components/BrandFooter";
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
  title: "Alankrutha | Premium Indian Ethnic Fashion",
  description: "Luxury-ready Indian ethnic wear for women, crafted with elegance, comfort, and timeless grace.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FFFDF8] text-[#2f1d24]">
        <div className="flex min-h-screen flex-col">
          <BrandHeader />
          <div className="flex-1">{children}</div>
          <BrandFooter />
        </div>
      </body>
    </html>
  );
}
