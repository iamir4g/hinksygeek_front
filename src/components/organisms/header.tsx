"use client";

import Link from "next/link";

import { Container } from "@/components/atoms/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-100">
          ThinksyGeek
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Games
          </Link>
        </nav>
      </Container>
    </header>
  );
}

