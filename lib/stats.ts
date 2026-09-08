import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const statsFile = path.join(dataDir, 'stats.json');

let memoryStats = {
  totalPremium: 142,
  todayPremium: 18,
  lastDate: getTodayDateString(),
};

function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function ensureDirExists() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (e) {
    // Ignore if running in constrained environment
  }
}

function loadStats() {
  ensureDirExists();
  try {
    if (fs.existsSync(statsFile)) {
      const raw = fs.readFileSync(statsFile, 'utf8');
      const data = JSON.parse(raw);

      const today = getTodayDateString();
      if (data.lastDate !== today) {
        data.todayPremium = 0;
        data.lastDate = today;
        saveStats(data);
      }
      memoryStats = data;
      return data;
    }
  } catch {
    // fallback to memoryStats
  }

  saveStats(memoryStats);
  return { ...memoryStats };
}

function saveStats(statsObj: any) {
  memoryStats = statsObj;
  try {
    ensureDirExists();
    fs.writeFileSync(statsFile, JSON.stringify(statsObj, null, 2), 'utf8');
  } catch {
    // silently fail disk write and keep in memory
  }
}

export function getStats(): { total: number; today: number } {
  const current = loadStats();
  return {
    total: current.totalPremium || memoryStats.totalPremium || 0,
    today: current.todayPremium || memoryStats.todayPremium || 0,
  };
}

export function incrementStats(): { total: number; today: number } {
  const current = loadStats();
  current.totalPremium = (current.totalPremium || memoryStats.totalPremium || 0) + 1;
  current.todayPremium = (current.todayPremium || memoryStats.todayPremium || 0) + 1;
  current.lastDate = getTodayDateString();
  saveStats(current);
  return {
    total: current.totalPremium,
    today: current.todayPremium,
  };
}
