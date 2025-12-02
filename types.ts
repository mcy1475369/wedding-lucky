export enum PrizeTier {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD'
}

export interface Winner {
  id: string;
  number: string;
  tier: PrizeTier;
  timestamp: number;
}

export interface LotterySettings {
  title: string;
  totalTickets: number; // e.g., 999
  
  // Prize Configurations
  config: {
    [key in PrizeTier]: {
      count: number;
      label: string;
      poolRange: { start: number; end: number }; // Specific range for this tier
    };
  };

  // Global exclusions
  excludedNumbers: string[];
}

export const DEFAULT_SETTINGS: LotterySettings = {
  title: "毛毛和新新的婚礼",
  totalTickets: 999,
  config: {
    [PrizeTier.FIRST]: { count: 1, label: "一等奖", poolRange: { start: 1, end: 999 } },
    [PrizeTier.SECOND]: { count: 5, label: "二等奖", poolRange: { start: 1, end: 999 } },
    [PrizeTier.THIRD]: { count: 10, label: "三等奖", poolRange: { start: 1, end: 999 } },
  },
  excludedNumbers: [],
};
