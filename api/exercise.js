export const config = { runtime: "edge" };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Cache helpers ─────────────────────────────────────────────────────────────

async function getCached(nameKey) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/exercise_cache?name_key=eq.${encodeURIComponent(nameKey)}&select=response_json&limit=1`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0]?.response_json || null;
  } catch {
    return null;
  }
}

async function setCached(nameKey, data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/exercise_cache`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        name_key: nameKey,
        response_json: data,
        cached_at: new Date().toISOString(),
      }),
    });
  } catch {
    // Cache write failure is non-fatal
  }
}

// ── Name → ID helpers ─────────────────────────────────────────────────────────

const EQUIPMENT_PREFIXES = /^(dumbbell|barbell|kettlebell|cable|machine|band|ez-bar|ez bar|bodyweight)\s+/i;

function nameVariants(name) {
  const toId = s => s.trim().replace(/\s+/g, "_");
  const toTitleId = s =>
    s.trim()
      .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .replace(/\s+/g, "_");

  const stripped = name.replace(EQUIPMENT_PREFIXES, "").trim();

  return [...new Set([
    toId(name),
    toTitleId(name),
    toId(stripped),
    toTitleId(stripped),
  ])].filter(Boolean);
}

// ── Handler ───────────────────────────────────────────────────────────────────

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

  const cacheKey = name.toLowerCase().trim();

  // 1. Check cache first
  const cached = await getCached(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
    });
  }

  // 2. Try API with multiple name variants
  const variants = nameVariants(name);

  for (const id of variants) {
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(id.replace(/_/g, " ").toLowerCase())}?limit=1&offset=0`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const exercise = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (exercise) {
        // Store in cache (fire and forget)
        setCached(cacheKey, exercise);
        return new Response(JSON.stringify(exercise), {
          status: 200,
          headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
        });
      }
    }
  }

  // No match found — cache the null so we don't keep hitting the API
  setCached(cacheKey, null);

  return new Response(JSON.stringify(null), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
