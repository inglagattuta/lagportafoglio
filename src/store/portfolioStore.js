import { create } from "zustand";

export const usePortfolioStore = create((set) => ({
  portfolio: [],
  setPortfolio: (data) => set({ portfolio: data }),
}));
