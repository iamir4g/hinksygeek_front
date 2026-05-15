"use client";

import Link from "next/link";
import * as React from "react";

import { CommentForm } from "@/components/molecules/comment-form";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/organisms/auth-provider";

type CommentItem = {
  id: number;
  content: string;
  authorName: string | null;
};

function getNested(obj: unknown, path: Array<string | number>) {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof key === "number") {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[key];
      continue;
    }
    if (typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function toComments(json: unknown): CommentItem[] {
  const data = getNested(json, ["data"]);
  if (!Array.isArray(data)) return [];

  return data
    .map((entry) => {
      const id = getNested(entry, ["id"]);
      const content =
        getNested(entry, ["attributes", "content"]) ??
        getNested(entry, ["content"]);
      const authorName =
        getNested(entry, [
          "attributes",
          "author",
          "data",
          "attributes",
          "username",
        ]) ??
        getNested(entry, ["author", "data", "username"]) ??
        getNested(entry, ["author", "username"]) ??
        null;

      if (typeof id !== "number") return null;
      if (typeof content !== "string" || content.trim().length === 0)
        return null;
      return {
        id,
        content,
        authorName: typeof authorName === "string" ? authorName : null,
      };
    })
    .filter((v): v is CommentItem => Boolean(v));
}

export function CommentSection({
  gameSlug,
  gameId,
}: {
  gameSlug: string;
  gameId?: number | string;
}) {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/comments?gameSlug=${encodeURIComponent(gameSlug)}`,
        {
          cache: "no-store",
        },
      );
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        setError("Failed to load comments.");
        setComments([]);
        return;
      }
      setComments(toComments(json));
    } finally {
      setLoading(false);
    }
  }, [gameSlug]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const redirect = `/games/${gameSlug}`;

  return (
    <div className="space-y-4">
      {user ? (
        <Card>
          <CardContent className="pt-4">
            {gameId ? (
              <CommentForm gameId={gameId} onSubmitted={load} />
            ) : (
              <div className="text-sm text-slate-300">
                Unable to submit comments for this game.
              </div>
            )}
          </CardContent>
        </Card>
      ) : authLoading ? null : (
        <div>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Login to comment
          </Link>
        </div>
      )}

      {error ? <div className="text-sm text-amber-200">{error}</div> : null}

      {loading ? (
        <div className="text-sm text-slate-300">Loading comments…</div>
      ) : comments.length === 0 ? (
        <Card>
          <CardContent className="pt-4 text-sm text-slate-300">
            No reviews yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {comments.slice(0, 8).map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4 text-sm text-slate-200">
                {c.authorName ? (
                  <div className="mb-2 text-xs text-slate-400">
                    {c.authorName}
                  </div>
                ) : null}
                {c.content}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
