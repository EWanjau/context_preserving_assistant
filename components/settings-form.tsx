"use client";

import { useState } from "react";

import type { UserSettings } from "@/lib/settings-store";

export function SettingsForm({ initial }: { initial: UserSettings }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={onSubmit} className="panel p-6 space-y-4 text-sm">
      <label className="block space-y-1">
        <span className="text-slate-400">Home city</span>
        <input
          className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-3 py-2"
          value={form.homeCity}
          onChange={(e) => setForm({ ...form, homeCity: e.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-slate-400">Latitude</span>
          <input
            type="number"
            step="any"
            className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-3 py-2"
            value={form.latitude}
            onChange={(e) =>
              setForm({ ...form, latitude: Number(e.target.value) })
            }
          />
        </label>
        <label className="block space-y-1">
          <span className="text-slate-400">Longitude</span>
          <input
            type="number"
            step="any"
            className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-3 py-2"
            value={form.longitude}
            onChange={(e) =>
              setForm({ ...form, longitude: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-slate-400">Temperature unit</span>
        <select
          className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-3 py-2"
          value={form.temperatureUnit}
          onChange={(e) =>
            setForm({
              ...form,
              temperatureUnit: e.target.value as UserSettings["temperatureUnit"],
            })
          }
        >
          <option value="celsius">Celsius</option>
          <option value="fahrenheit">Fahrenheit</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-slate-400">Assistant tone</span>
        <select
          className="w-full rounded-lg bg-slate-900/60 border border-slate-600/50 px-3 py-2"
          value={form.assistantTone}
          onChange={(e) =>
            setForm({
              ...form,
              assistantTone: e.target.value as UserSettings["assistantTone"],
            })
          }
        >
          <option value="friendly">Friendly</option>
          <option value="brief">Brief</option>
          <option value="formal">Formal</option>
        </select>
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-teal-500 text-slate-900 font-semibold py-2.5"
      >
        Save settings
      </button>
      {status === "saved" && (
        <p className="text-teal-300 text-xs">Saved to first-party API.</p>
      )}
      {status === "error" && (
        <p className="text-red-300 text-xs">Could not save.</p>
      )}
    </form>
  );
}
