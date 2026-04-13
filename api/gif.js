export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith("https://")) {
    return new Response("Missing or invalid url parameter", { status: 400 });
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FormLab/1.0)",
      "Referer": "https://rapidapi.com/",
      "Accept": "image/gif,image/webp,image/*",
    },
  });

  if (!response.ok) {
    return new Response(`Failed to fetch image: ${response.status}`, { status: response.status });
  }

  const contentType = response.headers.get("content-type") || "image/gif";
  const body = await response.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
