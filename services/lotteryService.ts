import { LotterySettings, Winner, PrizeTier, DEFAULT_SETTINGS } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'wedding_lottery_settings',
  WINNERS: 'wedding_lottery_winners',
};

// --- Helpers ---

const padNumber = (num: number): string => num.toString().padStart(3, '0');

// --- Getters ---

export const getSettings = (): LotterySettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const getWinners = (): Winner[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.WINNERS);
  return stored ? JSON.parse(stored) : [];
};

// --- Setters ---

export const saveSettings = (settings: LotterySettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const saveWinners = (winners: Winner[]): void => {
  localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(winners));
};

export const clearData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.WINNERS);
  // We usually keep settings, but if a hard reset is needed:
  // localStorage.removeItem(STORAGE_KEYS.SETTINGS);
};

// --- Logic ---

export const getAvailablePool = (tier: PrizeTier): string[] => {
  const settings = getSettings();
  const winners = getWinners();
  
  const tierConfig = settings.config[tier];
  const { start, end } = tierConfig.poolRange;
  const alreadyWonNumbers = new Set(winners.map(w => w.number));
  const excludedSet = new Set(settings.excludedNumbers);

  const pool: string[] = [];
  
  for (let i = start; i <= end; i++) {
    const ticket = padNumber(i);
    if (!alreadyWonNumbers.has(ticket) && !excludedSet.has(ticket)) {
      pool.push(ticket);
    }
  }

  return pool;
};

export const drawNumber = (tier: PrizeTier): Winner | null => {
  const pool = getAvailablePool(tier);
  
  if (pool.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * pool.length);
  const drawnNumber = pool[randomIndex];

  const newWinner: Winner = {
    id: crypto.randomUUID(),
    number: drawnNumber,
    tier: tier,
    timestamp: Date.now(),
  };

  const currentWinners = getWinners();
  saveWinners([...currentWinners, newWinner]);

  return newWinner;
};

export const canDraw = (tier: PrizeTier): boolean => {
  const settings = getSettings();
  const winners = getWinners();
  const tierWinners = winners.filter(w => w.tier === tier);
  
  // Check count limit
  if (tierWinners.length >= settings.config[tier].count) {
    return false;
  }
  
  // Check pool availability
  const pool = getAvailablePool(tier);
  return pool.length > 0;
};
