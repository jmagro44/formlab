export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // exercisedb.p.rapidapi.com — search by name, returns array sorted by relevance
  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name.toLowerCase().trim())}?limit=1&offset=0`,
    {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await response.json();

  // API returns an array — return first match or null
  const exercise = Array.isArray(data) && data.length > 0 ? data[0] : null;

  return new Response(JSON.stringify(exercise), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
