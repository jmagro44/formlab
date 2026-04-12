# FormLab

AI-powered personal trainer — generates custom workouts via Claude based on your goals, gear, and how you feel that day.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| AI | Anthropic API (`claude-sonnet-4-20250514`) |
| API proxy | Vercel Edge Function (`/api/workout`) |
| Auth + DB | Supabase *(wired up in v2)* |
| Hosting | Vercel |

---

## Local Setup

**1. Clone and install**
```bash
git clone https://github.com/jmagro44/formlab.git
cd formlab
npm install
```

**2. Add your environment variables**

Copy `.env.local` and fill in the three keys:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

**3. Run locally**

Use the Vercel CLI so the `/api/workout` edge function is available alongside the Vite dev server:
```bash
npm install -g vercel
vercel dev
```

> `npm run dev` alone will 404 on workout generation — the edge function only runs via `vercel dev` or a Vercel deployment.

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

For production, add these in your Vercel project under **Settings → Environment Variables**. `ANTHROPIC_API_KEY` is server-side only and never exposed to the client.

---

## Deploy

```bash
vercel
```

Vercel auto-detects the Vite framework and deploys the `/api/workout` edge function alongside the frontend.

---

## How It Works

1. **Onboarding** — user sets fitness level, goals, and available equipment (stored in React state; Supabase persistence coming in v2)
2. **Session check-in** — user picks duration, focus area, session style, and any notes (injuries, energy level, etc.)
3. **Workout generation** — a structured prompt is sent to Claude via the `/api/workout` proxy; Claude returns a JSON workout plan
4. **Workout view** — phases (warm-up / main / cool-down), expandable exercise cards with coaching cues, and a session timer

---

## Roadmap

- [x] Onboarding flow
- [x] AI workout generation via Claude
- [x] Session timer
- [ ] Supabase auth
- [ ] User profile persistence
- [ ] Workout history
