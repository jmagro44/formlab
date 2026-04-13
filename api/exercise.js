export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // API uses exercise name as ID with spaces → underscores
  // Try original casing first, then Title_Case as fallback
  const toId = str => str.trim().replace(/\s+/g, "_");
  const toTitleId = str =>
    str.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).replace(/\s+/g, "_");

  const attempts = [...new Set([toId(name), toTitleId(name)])];

  for (const id of attempts) {
    const response = await fetch(
      `https://exercise-db-fitness-workout-gym.p.rapidapi.com/exercise/${encodeURIComponent(id)}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "exercise-db-fitness-workout-gym.p.rapidapi.com",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // No match found
  return new Response(JSON.stringify(null), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
