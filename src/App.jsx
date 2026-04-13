import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const EQUIPMENT_OPTIONS = [
  { id: "barbell", label: "Barbell" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "bands", label: "Resistance Bands" },
  { id: "pullup_bar", label: "Pull-up Bar" },
  { id: "cable_machine", label: "Cable Machine" },
  { id: "trx", label: "TRX / Suspension" },
  { id: "bench", label: "Bench" },
  { id: "box", label: "Plyo Box" },
  { id: "bodyweight", label: "Bodyweight Only" },
];

const FOCUS_OPTIONS = [
  "Full Body", "Lower Body", "Upper Body", "Core", "Glutes & Hips",
  "Knee Strength", "Shoulder Health", "Mobility", "Cardio", "Power",
];

const FITNESS_LEVELS = ["Beginner", "Intermediate", "Advanced", "Athlete"];

const GOALS = [
  "Build Strength", "Lose Weight", "Improve Mobility", "Injury Recovery",
  "Athletic Performance", "General Fitness", "Muscle Gain", "Endurance",
];

const SESSION_STYLES = [
  "Circuit Training", "Straight Sets", "Supersets", "EMOM", "AMRAP", "Mixed / Surprise me",
];

const DURATIONS = ["15 min", "20 min", "30 min", "45 min", "60 min"];

// ─── STYLES ───────────────────────────────────────────────────────────────────

const css = `
  :root {
    --bg: #0d0f0e;
    --surface: #161918;
    --card: #1c1f1e;
    --border: #2a2f2d;
    --text: #e8ede9;
    --ink2: #a8b4aa;
    --muted: #6b7570;
    --accent: #b5f542;
    --accent2: #42f5c8;
    --warm: #f5a742;
    --radius: 5px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 999;
    opacity: 0.4;
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 0 28px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 40px;
  }
  .nav-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 0.12em;
    color: var(--text);
  }
  .nav-logo span { color: var(--accent); }
  .nav-profile {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    cursor: pointer;
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.15s;
    background: transparent;
    letter-spacing: 0.05em;
  }
  .nav-profile:hover { background: var(--surface); color: var(--text); border-color: var(--muted); }

  .page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(52px, 12vw, 80px);
    line-height: 0.9;
    letter-spacing: 0.02em;
    margin-bottom: 14px;
    color: var(--text);
  }
  .page-title .green { color: var(--accent); }
  .page-title .teal  { color: var(--accent2); }
  .page-subtitle {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.65;
    max-width: 420px;
    margin-bottom: 36px;
  }

  .steps { display: flex; gap: 6px; margin-bottom: 36px; }
  .step-dot {
    height: 2px; flex: 1; border-radius: 2px;
    background: var(--border); transition: background 0.3s;
  }
  .step-dot.active { background: var(--accent); }
  .step-dot.done   { background: var(--muted); }

  .section-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .field { margin-bottom: 28px; }
  .field-hint { font-size: 11px; color: var(--muted); margin-top: 8px; }

  .chip-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    padding: 7px 14px;
    border-radius: 3px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.04em;
  }
  .chip:hover { border-color: var(--text); color: var(--text); }
  .chip.selected {
    background: rgba(181,245,66,0.12);
    border-color: rgba(181,245,66,0.45);
    color: var(--accent);
  }

  .duration-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .dur-btn {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 0.06em;
    padding: 9px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .dur-btn:hover { border-color: var(--text); color: var(--text); }
  .dur-btn.selected {
    background: rgba(181,245,66,0.12);
    border-color: rgba(181,245,66,0.45);
    color: var(--accent);
  }

  .text-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    resize: vertical;
    min-height: 88px;
    transition: border-color 0.15s;
    outline: none;
  }
  .text-input:focus { border-color: rgba(181,245,66,0.4); }
  .text-input::placeholder { color: var(--muted); }

  .btn {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 19px;
    letter-spacing: 0.12em;
    padding: 13px 32px;
    border-radius: var(--radius);
    border: none;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-primary { background: var(--accent); color: #0d0f0e; width: 100%; }
  .btn-primary:hover { background: #c8f55a; }
  .btn-primary:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }
  .btn-secondary {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    font-size: 16px;
    padding: 11px 22px;
  }
  .btn-secondary:hover { color: var(--text); border-color: var(--muted); }
  .btn-row { display: flex; gap: 10px; margin-top: 32px; }
  .btn-row .btn-primary { flex: 1; }

  .profile-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    margin-bottom: 32px;
  }
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 4px; }
  .profile-item-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 5px;
  }
  .profile-item-value { font-size: 13px; color: var(--text); line-height: 1.5; }

  .generating {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 340px; gap: 18px; text-align: center;
  }
  .fl-tile-wrap {
    width: 160px;
    animation: tilePulse 1.8s ease-in-out infinite;
  }
  .fl-tile-svg {
    width: 100%;
    height: auto;
    display: block;
  }
  @keyframes tilePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.55; transform: scale(0.96); }
  }
  .gen-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px; letter-spacing: 0.18em; color: var(--accent); text-transform: uppercase;
    margin-top: 8px;
  }
  .gen-status { font-size: 13px; color: var(--muted); max-width: 300px; line-height: 1.65; text-align: center; }

  .workout-header { margin-bottom: 32px; }
  .workout-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .meta-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px; padding: 4px 10px; border-radius: 3px;
    border: 1px solid var(--border); color: var(--muted); letter-spacing: 0.06em;
  }
  .meta-badge.green { border-color: rgba(181,245,66,0.3); background: rgba(181,245,66,0.07); color: var(--accent); }
  .meta-badge.teal  { border-color: rgba(66,245,200,0.3); background: rgba(66,245,200,0.07); color: var(--accent2); }

  .phase-block { margin-bottom: 36px; }
  .phase-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .phase-tag {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px; letter-spacing: 0.1em; padding: 3px 10px; border-radius: 3px;
  }
  .tag-warmup { background: rgba(245,167,66,0.12); color: var(--warm); border: 1px solid rgba(245,167,66,0.25); }
  .tag-main   { background: rgba(181,245,66,0.10); color: var(--accent); border: 1px solid rgba(181,245,66,0.25); }
  .tag-cool   { background: rgba(66,245,200,0.10); color: var(--accent2); border: 1px solid rgba(66,245,200,0.25); }
  .phase-name { font-family: 'Bebas Neue', sans-serif; font-size: 21px; letter-spacing: 0.04em; color: var(--text); }
  .phase-time { margin-left: auto; font-family: 'DM Mono', monospace; font-size: 11px; color: var(--muted); }

  .ex-list { display: flex; flex-direction: column; gap: 8px; }
  .ex-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    display: grid;
    grid-template-columns: 26px 1fr auto;
    gap: 0 12px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    position: relative;
    overflow: hidden;
  }
  .ex-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: transparent; transition: background 0.2s;
  }
  .ex-card:hover { border-color: rgba(181,245,66,0.3); }
  .ex-card:hover::before { background: var(--accent); }
  .ex-card.open { background: #1f2321; }
  .ex-card.open::before { background: var(--accent); }

  .ex-num { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); padding-top: 2px; }
  .ex-name { font-size: 14px; font-weight: 500; margin-bottom: 3px; color: var(--text); }
  .ex-tag {
    display: inline-block;
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.1em; padding: 2px 7px; border-radius: 2px;
    background: rgba(181,245,66,0.08); color: var(--accent); border: 1px solid rgba(181,245,66,0.2);
    margin-top: 3px;
  }
  .ex-expand { margin-top: 10px; }
  .ex-cue {
    font-size: 12px; color: var(--muted); line-height: 1.65;
    padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 4px;
    border-left: 2px solid var(--accent); margin-bottom: 12px;
  }

  .ex-media-loading {
    display: flex; gap: 5px; padding: 12px 0; justify-content: center;
  }
  .ex-loading-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
    animation: dotPulse 1.2s ease-in-out infinite;
  }
  .ex-loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .ex-loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }

  .ex-media { margin-top: 4px; }
  .ex-gif {
    width: 100%; max-width: 320px; border-radius: 6px;
    display: block; margin: 0 auto 14px;
    border: 1px solid var(--border);
  }
  .ex-instructions {
    padding-left: 18px; margin: 0 0 12px;
  }
  .ex-instructions li {
    font-size: 12px; color: var(--muted); line-height: 1.65; margin-bottom: 5px;
  }
  .ex-muscles {
    display: flex; flex-wrap: wrap; align-items: center;
    gap: 6px; margin-top: 4px;
  }
  .ex-muscles-label {
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: 0.12em; color: var(--muted); text-transform: uppercase;
  }
  .ex-muscle-tag {
    font-family: 'DM Mono', monospace; font-size: 9px; padding: 2px 7px;
    border-radius: 2px; background: rgba(66,245,200,0.07);
    color: var(--accent2); border: 1px solid rgba(66,245,200,0.2);
    text-transform: capitalize;
  }
  .ex-yt-link {
    display: inline-block; margin-top: 4px;
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.08em;
    color: var(--warm); text-decoration: none;
    padding: 6px 12px; border: 1px solid rgba(245,167,66,0.25);
    border-radius: 3px; background: rgba(245,167,66,0.06);
    transition: all 0.15s;
  }
  .ex-yt-link:hover { background: rgba(245,167,66,0.12); border-color: rgba(245,167,66,0.4); }

  .ex-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .ex-sets { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text); white-space: nowrap; }
  .ex-equip { font-size: 10px; color: var(--muted); white-space: nowrap; }
  .ex-chevron { font-size: 9px; color: var(--muted); margin-top: 4px; transition: transform 0.2s; }
  .ex-card.open .ex-chevron { transform: rotate(180deg); }

  .timer-bar {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px 24px; margin: 28px 0;
    display: flex; align-items: center; gap: 20px;
  }
  .timer-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px; color: var(--accent); line-height: 1; min-width: 96px; letter-spacing: 0.04em;
  }
  .timer-info { flex: 1; }
  .timer-btn {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 17px; letter-spacing: 0.1em; padding: 10px 22px;
    border-radius: var(--radius); border: 1px solid var(--border);
    background: transparent; color: var(--muted); cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .timer-btn:hover { color: var(--text); border-color: var(--muted); }
  .timer-btn.active { background: var(--accent); border-color: var(--accent); color: #0d0f0e; }

  .coach-note {
    background: linear-gradient(135deg, rgba(181,245,66,0.06), rgba(66,245,200,0.04));
    border: 1px solid rgba(181,245,66,0.18);
    border-radius: var(--radius); padding: 14px 16px;
    font-size: 13px; color: var(--muted); line-height: 1.65; margin-bottom: 16px;
  }
  .coach-note strong { color: var(--accent); }

  .error-box {
    background: rgba(245,167,66,0.08); border: 1px solid rgba(245,167,66,0.25);
    border-radius: var(--radius); padding: 14px 16px;
    font-size: 13px; color: var(--warm); margin-top: 16px;
  }

  .fade-in { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

  /* SPLASH MODAL */
  .splash-overlay {
    position: fixed;
    inset: 0;
    background: rgba(13,15,14,0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.25s ease both;
  }
  .splash-modal {
    background: #1c1f1e;
    border: 1px solid #2a2f2d;
    border-radius: 10px;
    padding: 40px 36px 32px;
    width: 340px;
    max-width: 88vw;
    position: relative;
    text-align: center;
    animation: popIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .splash-close {
    position: absolute;
    top: 14px; right: 16px;
    background: transparent;
    border: none;
    color: var(--muted);
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
    padding: 4px;
    transition: color 0.15s;
  }
  .splash-close:hover { color: var(--text); }
  .splash-divider {
    width: 40px; height: 1px;
    background: var(--border);
    margin: 0 auto 24px;
  }

  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }

  .app {
    max-width: 640px;
    margin: 0 auto;
    padding: 0 20px 80px;
    min-height: 100vh;
  }

  /* ── AUTH ── */
  .auth-wrap {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 60vh; padding: 20px 0;
  }
  .auth-card {
    width: 100%; max-width: 400px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 36px 32px;
  }
  .auth-input {
    width: 100%; background: var(--bg);
    border: 1px solid var(--border); border-radius: var(--radius);
    padding: 11px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text); outline: none;
    transition: border-color 0.15s; margin-bottom: 12px;
  }
  .auth-input:focus { border-color: rgba(181,245,66,0.4); }
  .auth-input::placeholder { color: var(--muted); }
  .auth-error {
    font-size: 12px; color: var(--warm); margin-bottom: 14px;
    padding: 8px 12px; background: rgba(245,167,66,0.08);
    border: 1px solid rgba(245,167,66,0.2); border-radius: var(--radius);
  }
  .auth-toggle {
    text-align: center; margin-top: 20px;
    font-size: 13px; color: var(--muted);
  }
  .auth-toggle button {
    background: none; border: none; color: var(--accent);
    cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif;
    padding: 0; margin-left: 6px; text-decoration: underline;
  }

  /* ── ADMIN ── */
  .admin-header { margin-bottom: 28px; }
  .admin-table-wrap { overflow-x: auto; }
  .admin-table {
    width: 100%; border-collapse: collapse;
    font-size: 12px;
  }
  .admin-table th {
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--muted); padding: 8px 12px; text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .admin-table td {
    padding: 10px 12px; border-bottom: 1px solid var(--border);
    color: var(--text); vertical-align: top;
  }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-table tr:hover td { background: var(--surface); }
  .admin-badge {
    font-family: 'DM Mono', monospace; font-size: 9px;
    padding: 2px 7px; border-radius: 2px; letter-spacing: 0.08em;
    background: rgba(181,245,66,0.08); color: var(--accent);
    border: 1px solid rgba(181,245,66,0.2);
  }
  .admin-badge.inactive {
    background: rgba(107,117,112,0.1); color: var(--muted);
    border-color: var(--border);
  }
  .admin-action-btn {
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: 0.08em; padding: 3px 9px; border-radius: 2px;
    cursor: pointer; transition: all 0.15s; margin-right: 5px;
    background: transparent; border: 1px solid var(--border); color: var(--muted);
  }
  .admin-action-btn:hover { color: var(--text); border-color: var(--muted); }
  .admin-action-btn.danger { border-color: rgba(245,167,66,0.3); color: var(--warm); }
  .admin-action-btn.danger:hover { background: rgba(245,167,66,0.08); }
  .admin-empty { text-align: center; padding: 48px 0; color: var(--muted); font-size: 13px; }

  .nav-signout {
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: var(--muted); cursor: pointer; padding: 6px 14px;
    border: 1px solid var(--border); border-radius: var(--radius);
    transition: all 0.15s; background: transparent; letter-spacing: 0.05em;
    margin-left: 8px;
  }
  .nav-signout:hover { background: var(--surface); color: var(--text); border-color: var(--muted); }
  .nav-admin {
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: var(--accent); cursor: pointer; padding: 6px 14px;
    border: 1px solid rgba(181,245,66,0.3); border-radius: var(--radius);
    transition: all 0.15s; background: rgba(181,245,66,0.06); letter-spacing: 0.05em;
    margin-left: 8px;
  }
  .nav-admin:hover { background: rgba(181,245,66,0.12); }
  .nav-history {
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: var(--accent2); cursor: pointer; padding: 6px 14px;
    background: transparent; border: 1px solid rgba(66,245,200,0.25);
    border-radius: 4px; letter-spacing: 0.05em; margin-left: 8px;
  }
  .nav-history:hover { background: rgba(66,245,200,0.08); }

  /* ── HISTORY ── */
  .history-wrap { max-width: 640px; margin: 0 auto; padding: 40px 20px 80px; }
  .history-empty { text-align: center; padding: 64px 0; color: var(--muted); }
  .history-empty-icon { font-size: 40px; margin-bottom: 16px; }
  .history-list { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
  .history-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 18px 20px; cursor: pointer; transition: border-color 0.15s;
  }
  .history-card:hover { border-color: var(--accent2); }
  .history-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .history-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.04em; color: var(--text); }
  .history-card-date { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); white-space: nowrap; }
  .history-card-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .history-card-badge {
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.08em;
    padding: 3px 8px; border-radius: 3px; border: 1px solid var(--border); color: var(--muted);
  }
  .history-card-badge.green { border-color: rgba(181,245,66,0.3); color: var(--accent); background: rgba(181,245,66,0.06); }
  .history-card-badge.teal  { border-color: rgba(66,245,200,0.3); color: var(--accent2); background: rgba(66,245,200,0.06); }
  .history-detail-back { display: flex; align-items: center; gap: 8px; background: none; border: none; color: var(--muted); font-family: 'DM Mono', monospace; font-size: 11px; cursor: pointer; padding: 0; margin-bottom: 24px; letter-spacing: 0.05em; }
  .history-detail-back:hover { color: var(--text); }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function buildSystemPrompt(profile) {
  return `You are an expert personal trainer. Respond with ONLY a valid JSON object — no markdown, no preamble.

User profile: ${profile.fitnessLevel} level | Goals: ${profile.goals.join(", ")} | Equipment: ${profile.equipment.join(", ")}

JSON schema: {"title":string,"tagline":string,"duration":string,"focusArea":string,"sessionStyle":string,"coachNote":string,"phases":[{"phase":"Warm-Up"|"Main"|"Cool-Down","name":string,"duration":string,"exercises":[{"name":string,"sets":string,"equipment":string,"tag":string,"cue":string}]}]}

Rules:
- Only use listed equipment. Bodyweight only = no equipment.
- Respect injuries/limitations mentioned.
- Match intensity to fitness level.
- "tag": 2-3 words, primary muscle/benefit (e.g. "GLUTE + HIP").
- "cue": 1 concise sentence — the single most important technique tip.
- "coachNote": 1 sentence personalized to their goals and session.
- Real exercise names, correct sets/reps, smart sequencing.`;
}

function buildUserPrompt(profile, session) {
  return `Build a ${session.duration} ${session.focus} workout. Style: ${session.style}.${session.notes ? ` Notes: ${session.notes}` : ""} Return ONLY the JSON object.`;
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Chip({ label, selected, onClick, accent }) {
  return (
    <button
      className={`chip${selected ? " selected" + (accent ? " accent" : "") : ""}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

async function fetchExerciseData(name) {
  const res = await fetch(`/api/exercise?name=${encodeURIComponent(name)}`);
  const data = await res.json();
  if (!data) return null;
  // Proxy GIF through our server to avoid hotlink blocks
  if (data.gifUrl) {
    data.gifUrl = `/api/gif?url=${encodeURIComponent(data.gifUrl)}`;
  }
  return data;
}

function ExCard({ ex, idx }) {
  const [open, setOpen] = useState(false);
  const [exData, setExData] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  async function handleClick() {
    if (!open && !fetched.current) {
      fetched.current = true;
      setLoading(true);
      try {
        const data = await fetchExerciseData(ex.name);
        setExData(data);
      } catch {
        setExData(null);
      } finally {
        setLoading(false);
      }
    }
    setOpen(o => !o);
  }

  return (
    <div className={`ex-card${open ? " open" : ""}`} onClick={handleClick}>
      <div className="ex-num">{String(idx + 1).padStart(2, "0")}</div>
      <div style={{ minWidth: 0 }}>
        <div className="ex-name">{ex.name}</div>
        {ex.tag && <span className="ex-tag">{ex.tag}</span>}
        {open && (
          <div className="ex-expand">
            <div className="ex-cue">{ex.cue}</div>
            {loading && (
              <div className="ex-media-loading">
                <span className="ex-loading-dot" />
                <span className="ex-loading-dot" />
                <span className="ex-loading-dot" />
              </div>
            )}
            {!loading && exData && (
              <div className="ex-media">
                <img
                  src={exData.gifUrl}
                  alt={ex.name}
                  className="ex-gif"
                  loading="lazy"
                />
                {exData.instructions?.length > 0 && (
                  <ol className="ex-instructions">
                    {exData.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                )}
                {exData.secondaryMuscles?.length > 0 && (
                  <div className="ex-muscles">
                    <span className="ex-muscles-label">Also works:</span>
                    {exData.secondaryMuscles.map(m => (
                      <span key={m} className="ex-muscle-tag">{m}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!loading && !exData && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name)}+form+tutorial`}
                target="_blank"
                rel="noopener noreferrer"
                className="ex-yt-link"
                onClick={e => e.stopPropagation()}
              >
                ▶ Watch form tutorial on YouTube
              </a>
            )}
          </div>
        )}
      </div>
      <div className="ex-right">
        <div className="ex-sets">{ex.sets}</div>
        <div className="ex-equip">{ex.equipment}</div>
        <div className="ex-chevron">▼</div>
      </div>
    </div>
  );
}

function WorkoutView({ workout, sessionDuration, onReset }) {
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(parseInt(sessionDuration) * 60 || 20 * 60);
  const [elapsed, setElapsed] = useState(0);
  const total = parseInt(sessionDuration) * 60 || 20 * 60;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setTimerActive(false); return 0; }
          return s - 1;
        });
        setElapsed(e => e + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  const pad = n => String(n).padStart(2, "0");
  const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const pct = (elapsed / total) * 100;

  const phaseTagClass = p => p === "Warm-Up" ? "tag-warmup" : p === "Cool-Down" ? "tag-cool" : "tag-main";

  return (
    <div className="fade-in">
      <div className="workout-header">
        <div className="section-label">Your Session</div>
        <div className="page-title">{workout.title || "YOUR WORKOUT"}</div>
        {workout.tagline && <div className="page-subtitle">{workout.tagline}</div>}
        {workout.coachNote && (
          <div className="coach-note">
            <strong>Coach: </strong>
            {workout.coachNote}
          </div>
        )}
        <div className="workout-meta">
          <span className="meta-badge green">⏱ {workout.duration || sessionDuration}</span>
          <span className="meta-badge">{workout.focusArea}</span>
          <span className="meta-badge teal">{workout.sessionStyle}</span>
        </div>
      </div>

      {/* TIMER */}
      <div className="timer-bar">
        <div className="timer-num" style={{ color: seconds < 60 ? "var(--warm)" : timerActive ? "var(--accent2)" : "var(--accent)" }}>
          {fmt(seconds)}
        </div>
        <div className="timer-info">
          <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {timerActive ? "Session in progress" : seconds === total ? "Ready to start" : "Paused"}
          </div>
          <div style={{ marginTop: "8px", height: "2px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent2)", transition: "width 1s linear", borderRadius: "2px" }} />
          </div>
        </div>
        <button
          className={`timer-btn${timerActive ? " active" : ""}`}
          onClick={() => setTimerActive(a => !a)}
        >
          {timerActive ? "Pause" : seconds === total ? "Start" : "Resume"}
        </button>
      </div>

      {/* PHASES */}
      {workout.phases?.map((phase, pi) => (
        <div className="phase-block" key={pi}>
          <div className="section-label">Block {String(pi + 1).padStart(2, "0")}</div>
          <div className="phase-header">
            <span className={`phase-tag ${phaseTagClass(phase.phase)}`}>{phase.phase}</span>
            <span className="phase-name">{phase.name}</span>
            <span className="phase-time">{phase.duration}</span>
          </div>
          <div className="ex-list">
            {phase.exercises?.map((ex, ei) => (
              <ExCard key={ei} ex={ex} idx={ei} />
            ))}
          </div>
        </div>
      ))}

      <div className="btn-row" style={{ marginTop: "40px", borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
        <button className="btn btn-secondary" onClick={onReset}>New Session</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to Top
        </button>
      </div>
    </div>
  );
}

// ─── AUTH FORM SUB-COMPONENT ──────────────────────────────────────────────────

function AuthForm({ mode, onSubmit, submitting }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");
    if (mode === "signup" && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    onSubmit(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      {localError && <div className="auth-error">{localError}</div>}
      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />
      {mode === "signup" && (
        <input
          className="auth-input"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      )}
      <button
        className="btn btn-primary"
        type="submit"
        disabled={submitting}
        style={{ marginTop: "4px" }}
      >
        {submitting ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
      </button>
    </form>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function TrainerApp() {
  // VIEW: "auth" | "welcome" | "onboarding_1" | "onboarding_2" | "onboarding_3" | "splash" | "session" | "generating" | "workout" | "admin"
  const [view, setView] = useState("welcome");
  const [profile, setProfile] = useState({
    name: "",
    fitnessLevel: "",
    equipment: [],
    goals: [],
  });
  const [session, setSession] = useState({
    duration: "20 min",
    focus: "",
    style: "Mixed / Surprise me",
    notes: "",
  });
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState("");

  // ── AUTH STATE ──
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // ── ADMIN STATE ──
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // ── HISTORY STATE ──
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDetail, setHistoryDetail] = useState(null); // workout object being viewed

  const toggleArr = (arr, val) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const sessionComplete = session.duration && session.focus;

  // ── AUTH ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: supaSession } }) => {
      if (supaSession?.user) {
        setUser(supaSession.user);
        loadProfile(supaSession.user);
      } else {
        setView("auth");
        setAuthLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supaSession) => {
      if (event === "SIGNED_IN" && supaSession?.user) {
        setUser(supaSession.user);
        loadProfile(supaSession.user);
      } else if (event === "SIGNED_OUT" || !supaSession) {
        setUser(null); setIsAdmin(false); setView("auth");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(supaUser) {
    const { data } = await supabase.from("profiles").select("*").eq("id", supaUser.id).single();
    if (data?.fitness_level) {
      setProfile(p => ({ ...p, fitnessLevel: data.fitness_level, goals: data.goals || [], equipment: data.equipment || [] }));
      setIsAdmin(data.is_admin || false);
      setView("session");
    } else {
      setView("onboarding_1");
    }
    setAuthLoading(false);
  }

  async function saveProfile() {
    if (!user) return;
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      fitness_level: profile.fitnessLevel,
      goals: profile.goals,
      equipment: profile.equipment,
      updated_at: new Date().toISOString(),
    });
  }

  async function handleSignUp(email, password) {
    setAuthSubmitting(true); setAuthError("");
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setAuthError(signUpError.message); setAuthSubmitting(false); return; }
    // Email confirmation required — show check-email screen
    // onAuthStateChange SIGNED_IN will fire automatically when they click the link
    setAuthMode("check_email");
    setAuthSubmitting(false);
  }

  async function handleLogin(email, password) {
    setAuthSubmitting(true); setAuthError("");
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) { setAuthError(loginError.message); setAuthSubmitting(false); return; }
    const { data: { session: supaSession } } = await supabase.auth.getSession();
    if (supaSession?.user) { setUser(supaSession.user); loadProfile(supaSession.user); }
    setAuthSubmitting(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile({ name: "", fitnessLevel: "", equipment: [], goals: [] });
    setSession(s => ({ ...s, notes: "", focus: "", style: "Mixed / Surprise me" }));
    setWorkout(null);
    setView("auth");
  }

  async function fetchAdminUsers() {
    setAdminLoading(true);
    const { data: { session: supaSession } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supaSession.access_token}` },
      body: JSON.stringify({ action: "list_users" }),
    });
    const data = await res.json();
    setAdminUsers(Array.isArray(data) ? data : []);
    setAdminLoading(false);
  }

  async function handleToggleAdmin(userId, currentValue) {
    const { data: { session: supaSession } } = await supabase.auth.getSession();
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supaSession.access_token}` },
      body: JSON.stringify({ action: "toggle_admin", userId, updates: { is_admin: !currentValue } }),
    });
    fetchAdminUsers();
  }

  async function handleDeleteUser(userId) {
    if (!confirm("Permanently delete this user and all their data?")) return;
    const { data: { session: supaSession } } = await supabase.auth.getSession();
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supaSession.access_token}` },
      body: JSON.stringify({ action: "delete_user", userId }),
    });
    fetchAdminUsers();
  }

  async function saveWorkoutToHistory(parsed) {
    if (!user) return;
    await supabase.from("workouts").insert({
      user_id: user.id,
      title: parsed.title || "Workout",
      focus_area: parsed.focusArea || "",
      session_style: parsed.sessionStyle || "",
      duration_mins: parseInt(session.duration) || 20,
      workout_json: parsed,
    });
  }

  async function fetchHistory() {
    if (!user) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from("workouts")
      .select("id, created_at, title, focus_area, session_style, duration_mins, workout_json")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory(data || []);
    setHistoryLoading(false);
  }

  async function deleteWorkout(id) {
    if (!confirm("Remove this workout from your history?")) return;
    await supabase.from("workouts").delete().eq("id", id).eq("user_id", user.id);
    setHistory(h => h.filter(w => w.id !== id));
    if (historyDetail?.id === id) setHistoryDetail(null);
  }

  async function generateWorkout() {
    setView("generating");
    setError("");
    try {
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: buildSystemPrompt(profile),
          messages: [{ role: "user", content: buildUserPrompt(profile, session) }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setWorkout(parsed);
      saveWorkoutToHistory(parsed);
      setView("workout");
    } catch (e) {
      setError("Couldn't generate your workout. Check your connection and try again.");
      setView("session");
    }
  }

  // ── RENDER ──

  // Auth loading state
  if (authLoading) {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="generating" style={{ minHeight: "100vh" }}>
            <div className="fl-tile-wrap">
              <svg viewBox="0 0 250 350" xmlns="http://www.w3.org/2000/svg" className="fl-tile-svg">
                <rect x="0" y="0" width="250" height="350" rx="6" fill="#1c1f1e" stroke="#b5f542" strokeWidth="2.5"/>
                <rect x="9" y="9" width="232" height="332" rx="3" fill="none" stroke="#2a2f2d" strokeWidth="1"/>
                <circle cx="16" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="16" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <text x="20" y="42" fontFamily="'Arial Black',Arial,sans-serif" fontSize="22" fontWeight="900" fill="#6b7570" textAnchor="start">315</text>
                <text x="105" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="148" fontWeight="700" fill="#b5f542">F</text>
                <text x="170" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="82" fontWeight="700" fill="#ffffff">L</text>
                <line x1="18" y1="258" x2="232" y2="258" stroke="#2a2f2d" strokeWidth="1"/>
                <text x="125" y="292" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="400" fill="#a8b4aa" letterSpacing="3">Formlab</text>
                <text x="125" y="320" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="500" fill="#6b7570" letterSpacing="1">2026.0</text>
              </svg>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">Form<span>Lab</span></div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {view !== "welcome" && view !== "onboarding_1" && view !== "onboarding_2" && view !== "onboarding_3" && view !== "auth" && (
              <button className="nav-profile" onClick={() => setView("onboarding_1")}>
                Edit Profile
              </button>
            )}
            {(view === "session" || view === "workout" || view === "history") && (
              <button className="nav-history" onClick={() => { fetchHistory(); setHistoryDetail(null); setView("history"); }}>
                History
              </button>
            )}
            {isAdmin && view !== "admin" && (
              <button className="nav-admin" onClick={() => { fetchAdminUsers(); setView("admin"); }}>
                Admin
              </button>
            )}
            {(view === "admin" || view === "session" || view === "workout" || view === "history") && (
              <button className="nav-signout" onClick={handleSignOut}>
                Sign Out
              </button>
            )}
          </div>
        </nav>

        {/* ── AUTH ── */}
        {view === "auth" && (
          <div className="auth-wrap fade-in">
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <svg viewBox="0 0 250 350" xmlns="http://www.w3.org/2000/svg" style={{ width: "80px", height: "auto", display: "block", margin: "0 auto" }}>
                <rect x="0" y="0" width="250" height="350" rx="6" fill="#1c1f1e" stroke="#b5f542" strokeWidth="2.5"/>
                <rect x="9" y="9" width="232" height="332" rx="3" fill="none" stroke="#2a2f2d" strokeWidth="1"/>
                <circle cx="16" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="16" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <text x="20" y="42" fontFamily="'Arial Black',Arial,sans-serif" fontSize="22" fontWeight="900" fill="#6b7570" textAnchor="start">315</text>
                <text x="105" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="148" fontWeight="700" fill="#b5f542">F</text>
                <text x="170" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="82" fontWeight="700" fill="#ffffff">L</text>
                <line x1="18" y1="258" x2="232" y2="258" stroke="#2a2f2d" strokeWidth="1"/>
                <text x="125" y="292" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="400" fill="#a8b4aa" letterSpacing="3">Formlab</text>
                <text x="125" y="320" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="500" fill="#6b7570" letterSpacing="1">2026.0</text>
              </svg>
            </div>
            <div className="auth-card">
              {authMode === "check_email" ? (
                <>
                  <div className="section-label">Check your inbox</div>
                  <div className="page-title" style={{ fontSize: "clamp(36px,8vw,52px)", marginBottom: "16px" }}>
                    ONE MORE<br /><span className="green">STEP.</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.7", marginBottom: "24px" }}>
                    We sent a confirmation link to your email. Click it to activate your account — this tab will update automatically.
                  </p>
                  <div className="auth-toggle" style={{ marginTop: 0 }}>
                    Wrong email?
                    <button onClick={() => { setAuthMode("signup"); setAuthError(""); }}>Start over</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="section-label">{authMode === "login" ? "Sign In" : "Create Account"}</div>
                  <div className="page-title" style={{ fontSize: "clamp(36px,8vw,52px)", marginBottom: "24px" }}>
                    {authMode === "login" ? <><span className="green">WELCOME</span><br />BACK.</> : <>LET'S<br /><span className="green">BEGIN.</span></>}
                  </div>
                  {authError && <div className="auth-error">{authError}</div>}
                  <AuthForm
                    mode={authMode}
                    onSubmit={authMode === "login" ? handleLogin : handleSignUp}
                    submitting={authSubmitting}
                  />
                  <div className="auth-toggle">
                    {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
                      {authMode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── WELCOME ── */}
        {view === "welcome" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px", marginTop: "8px" }}>
              <svg viewBox="0 0 250 350" xmlns="http://www.w3.org/2000/svg" style={{ width: "130px", height: "auto", display: "block" }}>
                <rect x="0" y="0" width="250" height="350" rx="6" fill="#1c1f1e" stroke="#b5f542" strokeWidth="2.5"/>
                <rect x="9" y="9" width="232" height="332" rx="3" fill="none" stroke="#2a2f2d" strokeWidth="1"/>
                <circle cx="16" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="16" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <text x="20" y="42" fontFamily="'Arial Black',Arial,sans-serif" fontSize="22" fontWeight="900" fill="#6b7570" textAnchor="start">315</text>
                <text x="105" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="148" fontWeight="700" fill="#b5f542">F</text>
                <text x="170" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="82" fontWeight="700" fill="#ffffff">L</text>
                <line x1="18" y1="258" x2="232" y2="258" stroke="#2a2f2d" strokeWidth="1"/>
                <text x="125" y="292" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="400" fill="#a8b4aa" letterSpacing="3">Formlab</text>
                <text x="125" y="320" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="500" fill="#6b7570" letterSpacing="1">2026.0</text>
              </svg>
            </div>

            <div className="page-title">WELCOME<br />TO<br /><span className="green">FORMLAB.</span></div>

            <div style={{ marginBottom: "32px", marginTop: "4px" }}>
              <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: "1.75", marginBottom: "16px" }}>
                Congrats on taking the first step — that's always the hardest one, and you just cleared it.
              </p>
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.75", marginBottom: "16px" }}>
                You're kicking off something real here. Whether you're chasing strength, bouncing back from an injury, or just showing up consistently — we're going to build sessions around exactly what you need.
              </p>
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.75" }}>
                We're honored you chose to train with us. Let's get to work.
              </p>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(181,245,66,0.06), rgba(66,245,200,0.04))",
              border: "1px solid rgba(181,245,66,0.18)",
              borderRadius: "var(--radius)",
              padding: "16px 18px",
              marginBottom: "36px",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "var(--accent)", lineHeight: "1", paddingTop: "2px", minWidth: "28px" }}>✦</div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "6px" }}>How it works</div>
                <div style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.65" }}>
                  Build your profile once, then tell your trainer what you need before each session — duration, focus, how your body feels that day. We'll handle the rest.
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setView("onboarding_1")}>
              Build My Profile →
            </button>
          </div>
        )}

        {/* ── STEP 1: Fitness Level ── */}
        {view === "onboarding_1" && (
          <div className="fade-in">
            <div className="steps">
              <div className="step-dot active" />
              <div className="step-dot" />
              <div className="step-dot" />
            </div>
            <div className="page-title">LET'S<br /><span className="green">BUILD</span><br />YOUR PROFILE</div>
            <div className="page-subtitle">Quick setup so your trainer knows how to program for you.</div>

            <div className="section-label">Step 01 — Fitness Level</div>
            <div className="field">
              <div className="chip-grid">
                {FITNESS_LEVELS.map(l => (
                  <Chip key={l} label={l} selected={profile.fitnessLevel === l}
                    onClick={() => setProfile(p => ({ ...p, fitnessLevel: l }))} />
                ))}
              </div>
            </div>

            <div className="section-label">Your Goals</div>
            <div className="field">
              <div className="chip-grid">
                {GOALS.map(g => (
                  <Chip key={g} label={g} selected={profile.goals.includes(g)}
                    onClick={() => setProfile(p => ({ ...p, goals: toggleArr(p.goals, g) }))} />
                ))}
              </div>
              <div className="field-hint">Pick everything that applies.</div>
            </div>

            <button
              className="btn btn-primary"
              disabled={!profile.fitnessLevel || profile.goals.length === 0}
              onClick={() => setView("onboarding_2")}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: Equipment ── */}
        {view === "onboarding_2" && (
          <div className="fade-in">
            <div className="steps">
              <div className="step-dot done" />
              <div className="step-dot active" />
              <div className="step-dot" />
            </div>
            <div className="page-title">YOUR<br /><span className="green">GEAR</span></div>
            <div className="page-subtitle">Only exercises using what you actually have. No "just grab a barbell" moments.</div>

            <div className="section-label">Step 02 — Available Equipment</div>
            <div className="field">
              <div className="chip-grid">
                {EQUIPMENT_OPTIONS.map(e => (
                  <Chip key={e.id} label={e.label} selected={profile.equipment.includes(e.label)}
                    onClick={() => setProfile(p => ({ ...p, equipment: toggleArr(p.equipment, e.label) }))} />
                ))}
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setView("onboarding_1")}>Back</button>
              <button
                className="btn btn-primary"
                disabled={profile.equipment.length === 0}
                onClick={() => setView("onboarding_3")}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {view === "onboarding_3" && (
          <div className="fade-in">
            <div className="steps">
              <div className="step-dot done" />
              <div className="step-dot done" />
              <div className="step-dot active" />
            </div>
            <div className="page-title">LOOKS<br /><span className="green">GOOD.</span></div>
            <div className="page-subtitle">Here's your profile. You can always edit it later.</div>

            <div className="section-label">Your Profile</div>
            <div className="profile-card">
              <div className="profile-grid">
                <div className="profile-item">
                  <div className="profile-item-label">Fitness Level</div>
                  <div className="profile-item-value">{profile.fitnessLevel}</div>
                </div>
                <div className="profile-item">
                  <div className="profile-item-label">Goals</div>
                  <div className="profile-item-value">{profile.goals.join(", ")}</div>
                </div>
                <div className="profile-item" style={{ gridColumn: "1 / -1" }}>
                  <div className="profile-item-label">Equipment</div>
                  <div className="profile-item-value">{profile.equipment.join(", ")}</div>
                </div>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setView("onboarding_2")}>Back</button>
              <button className="btn btn-primary" onClick={async () => { await saveProfile(); setView("splash"); }}>
                Start Training →
              </button>
            </div>
          </div>
        )}

        {/* ── SPLASH MODAL ── */}
        {view === "splash" && (
          <div className="splash-overlay">
            <div className="splash-modal">
              <button className="splash-close" onClick={() => setView("session")}>&#x2715;</button>

              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "12px", letterSpacing: "0.22em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "20px" }}>
                FormLab
              </div>

              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "50px", letterSpacing: "0.04em", color: "var(--text)", lineHeight: "1", marginBottom: "4px" }}>
                Lace up!
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "50px", letterSpacing: "0.04em", color: "var(--accent)", lineHeight: "1", marginBottom: "24px" }}>
                It's go time.
              </div>

              <div className="splash-divider" />

              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "var(--muted)", lineHeight: "1.7", margin: "0 0 32px", letterSpacing: "0.02em" }}>
                Your trainer is ready — let's build your first session.
              </p>

              <button
                className="btn btn-primary"
                onClick={() => setView("session")}
                style={{ fontSize: "20px", letterSpacing: "0.14em" }}
              >
                Let's Go
              </button>
            </div>
          </div>
        )}

        {/* ── SESSION CHECK-IN ── */}
        {view === "session" && (
          <div className="fade-in">
            <div className="page-title">TODAY'S<br /><span className="green">SESSION</span></div>
            <div className="page-subtitle">Tell your trainer what you need today.</div>

            <div className="section-label">Duration</div>
            <div className="field">
              <div className="duration-row">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    className={`dur-btn${session.duration === d ? " selected" : ""}`}
                    onClick={() => setSession(s => ({ ...s, duration: d }))}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-label">Focus Area</div>
            <div className="field">
              <div className="chip-grid">
                {FOCUS_OPTIONS.map(f => (
                  <Chip key={f} label={f} selected={session.focus === f}
                    onClick={() => setSession(s => ({ ...s, focus: f }))} />
                ))}
              </div>
            </div>

            <div className="section-label">Session Style</div>
            <div className="field">
              <div className="chip-grid">
                {SESSION_STYLES.map(st => (
                  <Chip key={st} label={st} selected={session.style === st}
                    onClick={() => setSession(s => ({ ...s, style: st }))} />
                ))}
              </div>
            </div>

            <div className="section-label">Anything Else? (Optional)</div>
            <div className="field">
              <textarea
                className="text-input"
                placeholder="e.g. Left knee has been sore this week. Skip deep squats. Feeling low energy — keep it moderate."
                value={session.notes}
                onChange={e => setSession(s => ({ ...s, notes: e.target.value }))}
              />
              <div className="field-hint">Injuries, energy level, specific requests — your trainer reads this.</div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              className="btn btn-primary"
              style={{ marginTop: "8px" }}
              disabled={!sessionComplete}
              onClick={generateWorkout}
            >
              Build My Workout →
            </button>
          </div>
        )}

        {/* ── GENERATING ── */}
        {view === "generating" && (
          <div className="generating fade-in">
            <div className="fl-tile-wrap">
              <svg viewBox="0 0 250 350" xmlns="http://www.w3.org/2000/svg" className="fl-tile-svg">
                <rect x="0" y="0" width="250" height="350" rx="6" fill="#1c1f1e" stroke="#b5f542" strokeWidth="2.5"/>
                <rect x="9" y="9" width="232" height="332" rx="3" fill="none" stroke="#2a2f2d" strokeWidth="1"/>
                <circle cx="16" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="16" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="16" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <circle cx="234" cy="334" r="3" fill="#b5f542" opacity="0.3"/>
                <text x="20" y="42" fontFamily="'Arial Black',Arial,sans-serif" fontSize="22" fontWeight="900" fill="#6b7570" textAnchor="start">315</text>
                <text x="105" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="148" fontWeight="700" fill="#b5f542">F</text>
                <text x="170" y="228" textAnchor="middle" fontFamily="'Arial Narrow','Helvetica Neue',Arial,sans-serif" fontSize="82" fontWeight="700" fill="#ffffff">L</text>
                <line x1="18" y1="258" x2="232" y2="258" stroke="#2a2f2d" strokeWidth="1"/>
                <text x="125" y="292" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="400" fill="#a8b4aa" letterSpacing="3">Formlab</text>
                <text x="125" y="320" textAnchor="middle" fontFamily="'DM Mono','Courier New',monospace" fontSize="16" fontWeight="500" fill="#6b7570" letterSpacing="1">2026.0</text>
              </svg>
            </div>
            <div className="gen-label">Building your session</div>
            <div className="gen-status">
              Designing a {session.duration} {session.focus} workout for your {profile.fitnessLevel.toLowerCase()} level and available gear…
            </div>
          </div>
        )}

        {/* ── WORKOUT OUTPUT ── */}
        {view === "workout" && workout && (
          <WorkoutView
            workout={workout}
            sessionDuration={session.duration}
            onReset={() => {
              setSession(s => ({ ...s, notes: "", focus: "", style: "Mixed / Surprise me" }));
              setView("session");
            }}
          />
        )}

        {/* ── ADMIN PANEL ── */}
        {view === "admin" && isAdmin && (
          <div className="fade-in">
            <div className="admin-header">
              <div className="section-label">Admin Panel</div>
              <div className="page-title">USERS</div>
            </div>
            {adminLoading ? (
              <div className="admin-empty">Loading users…</div>
            ) : adminUsers.length === 0 ? (
              <div className="admin-empty">No users found.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Level</th>
                      <th>Goals</th>
                      <th>Equipment</th>
                      <th>Admin</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(u => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.fitness_level || "—"}</td>
                        <td>{u.goals?.length ? u.goals.join(", ") : "—"}</td>
                        <td>{u.equipment?.length ? u.equipment.join(", ") : "—"}</td>
                        <td>
                          <span className={`admin-badge${u.is_admin ? "" : " inactive"}`}>
                            {u.is_admin ? "Admin" : "User"}
                          </span>
                        </td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button className="admin-action-btn" onClick={() => handleToggleAdmin(u.id, u.is_admin)}>
                            {u.is_admin ? "Remove Admin" : "Make Admin"}
                          </button>
                          <button className="admin-action-btn danger" onClick={() => handleDeleteUser(u.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="btn-row" style={{ marginTop: "40px", borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
              <button className="btn btn-secondary" onClick={() => setView("session")}>← Back</button>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {view === "history" && (
          <div className="history-wrap fade-in">
            {historyDetail ? (
              <>
                <button className="history-detail-back" onClick={() => setHistoryDetail(null)}>
                  ← Back to History
                </button>
                <WorkoutView
                  workout={historyDetail.workout_json}
                  sessionDuration={String(historyDetail.duration_mins)}
                  onReset={() => setHistoryDetail(null)}
                />
              </>
            ) : (
              <>
                <div className="section-label" style={{ marginBottom: "4px" }}>Your Sessions</div>
                <div className="page-title">WORKOUT HISTORY</div>
                {historyLoading ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>Loading…</div>
                ) : history.length === 0 ? (
                  <div className="history-empty">
                    <div className="history-empty-icon">🏋️</div>
                    <div style={{ color: "var(--muted)", fontSize: "14px" }}>No workouts yet. Generate your first session!</div>
                    <button className="btn btn-primary" style={{ marginTop: "24px" }} onClick={() => setView("session")}>
                      Build a Workout →
                    </button>
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map(w => (
                      <div className="history-card" key={w.id} onClick={() => setHistoryDetail(w)}>
                        <div className="history-card-top">
                          <div className="history-card-title">{w.title}</div>
                          <div className="history-card-date">
                            {new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                        <div className="history-card-meta">
                          <span className="history-card-badge green">⏱ {w.duration_mins} min</span>
                          {w.focus_area && <span className="history-card-badge">{w.focus_area}</span>}
                          {w.session_style && <span className="history-card-badge teal">{w.session_style}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {history.length > 0 && (
                  <div className="btn-row" style={{ marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                    <button className="btn btn-secondary" onClick={() => setView("session")}>← Back to Session</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </>
  );
}
