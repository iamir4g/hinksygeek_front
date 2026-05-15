import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getStrapiBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gameSlug = url.searchParams.get("gameSlug");
  if (!gameSlug) {
    return NextResponse.json({ error: "Missing gameSlug." }, { status: 400 });
  }

  const qs = new URLSearchParams();
  qs.set("filters[game][slug][$eq]", gameSlug);
  qs.set("populate[0]", "author");
  qs.set("sort[0]", "createdAt:desc");

  const strapiUrl = new URL(`/api/comments?${qs.toString()}`, getStrapiBaseUrl());
  const res = await fetch(strapiUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to load comments." },
      { status: res.status },
    );
  }

  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("strapi_jwt")?.value ?? null;
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as
    | { content?: string; gameId?: number | string }
    | null;

  const content = payload?.content?.trim() ?? "";
  const gameId = payload?.gameId ?? null;

  if (!content || !gameId) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const strapiUrl = new URL("/api/comments", getStrapiBaseUrl());
  const res = await fetch(strapiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ data: { content, game: gameId } }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to submit comment." },
      { status: res.status },
    );
  }

  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

