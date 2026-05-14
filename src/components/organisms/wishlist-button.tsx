"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

function readWishlist() {
  try {
    const raw = localStorage.getItem("wishlist");
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr)
      ? arr.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function writeWishlist(list: string[]) {
  try {
    localStorage.setItem("wishlist", JSON.stringify(list));
  } catch {}
}

export function WishlistButton({ slug }: { slug: string }) {
  const [active, setActive] = React.useState(() =>
    readWishlist().includes(slug),
  );

  function toggle() {
    const list = readWishlist();
    const next = list.includes(slug)
      ? list.filter((s) => s !== slug)
      : [...list, slug];
    writeWishlist(next);
    setActive(next.includes(slug));
  }

  return (
    <Button
      onClick={toggle}
      variant={active ? "amber" : "default"}
      className="w-full sm:w-auto"
    >
      {active ? "In Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
