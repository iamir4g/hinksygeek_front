export type StrapiCollectionResponse<T> = {
  data: Array<
    {
      id: number;
      documentId?: string;
      attributes?: T;
    } & T
  >;
  meta?: unknown;
};

export type StrapiSingleResponse<T> = {
  data:
    | ({
        id: number;
        documentId?: string;
        attributes?: T;
      } & T)
    | null;
  meta?: unknown;
};

type FetchOptions = Omit<RequestInit, "cache"> & { cache?: RequestCache };

function getBaseUrl() {
  return (
    process.env.STRAPI_API_URL ??
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    "http://localhost:1337"
  );
}

function getPublicBaseUrl() {
  return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
}

async function fetchJson<T>(path: string, options?: FetchOptions): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as T;
}

function unwrap<T>(entity: { attributes?: T } & Partial<T>): T {
  return (entity.attributes ?? entity) as T;
}

export function getStrapiMediaUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getPublicBaseUrl()}${url}`;
}

export type StrapiMedia = {
  url?: string;
  alternativeText?: string;
};

type RelationMany<T> =
  | { data?: Array<{ id: number; attributes?: T } & T> }
  | Array<T>
  | undefined;

export type Game = {
  title?: string;
  slug?: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  age?: number;
  complexity?: number;
  rating?: number;
  images?: RelationMany<StrapiMedia>;
  categories?: RelationMany<{ name?: string; slug?: string }>;
  mechanics?: RelationMany<{ name?: string; slug?: string }>;
  publisher?: { data?: { id: number; attributes?: { name?: string } } };
  designer?: { data?: { id: number; attributes?: { name?: string } } };
  comments?: RelationMany<{ text?: string; user?: unknown }>;
};

export async function getGames() {
  const res = await fetchJson<StrapiCollectionResponse<Game>>(
    "/api/games?populate=images,categories,mechanics",
    { cache: "no-store" },
  );
  return res.data.map((e) => unwrap<Game>(e));
}

export async function getGameBySlug(slug: string) {
  const qs = new URLSearchParams();
  qs.set("populate", "images,categories,mechanics,publisher,designer,comments");
  qs.set("filters[slug][$eq]", slug);

  const res = await fetchJson<StrapiCollectionResponse<Game>>(
    `/api/games?${qs.toString()}`,
    { cache: "no-store" },
  );
  const first = res.data[0];
  return first ? unwrap<Game>(first) : null;
}
