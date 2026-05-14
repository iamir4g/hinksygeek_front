"use client";

import * as React from "react";

import { Header } from "@/components/organisms/header";
import { PageTransition } from "@/components/organisms/page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

