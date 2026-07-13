import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/organisms/app-shell";

export const metadata: Metadata = {
  title: "بازی‌گیک | بوردبرد",
  description: "مرجع منتقدین و کلوب هواداران بازی‌های رومیزی ایران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
=======
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100">
>>>>>>> feat/changedesgin
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
