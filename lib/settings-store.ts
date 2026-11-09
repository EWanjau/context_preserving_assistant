import { promises as fs } from "fs";
import path from "path";

export type UserSettings = {
  homeCity: string;
  latitude: number;
  longitude: number;
  temperatureUnit: "celsius" | "fahrenheit";
  assistantTone: "brief" | "friendly" | "formal";
};

type SettingsDatabase = Record<string, UserSettings>;

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "settings.json");

const DEFAULTS: UserSettings = {
  homeCity: "Nairobi",
  latitude: -1.2864,
  longitude: 36.8172,
  temperatureUnit: "celsius",
  assistantTone: "friendly",
};

async function readDb(): Promise<SettingsDatabase> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as SettingsDatabase;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // cold start
  }
  return {};
}

async function writeDb(db: SettingsDatabase) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const db = await readDb();
  return db[userId] ?? { ...DEFAULTS };
}

export async function saveUserSettings(
  userId: string,
  patch: Partial<UserSettings>,
): Promise<UserSettings> {
  const db = await readDb();
  const current = db[userId] ?? { ...DEFAULTS };
  const next: UserSettings = {
    ...current,
    ...patch,
    homeCity: patch.homeCity?.slice(0, 80) ?? current.homeCity,
    temperatureUnit: patch.temperatureUnit ?? current.temperatureUnit,
    assistantTone: patch.assistantTone ?? current.assistantTone,
  };
  db[userId] = next;
  await writeDb(db);
  return next;
}
