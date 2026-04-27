import { Injectable } from '@angular/core';

export interface BillHistory {
  id: string;
  date: Date;
  totalBill: number;
  numPeople: number;
  splitMode?: 'even' | 'custom';
  tipPercent?: number;
  servicePercent?: number;
  tipAmount?: number;
  serviceAmount?: number;
  peopleBreakdown?: {
    name: string;
    itemCount: number;
    subtotal: number;
    total: number;
  }[];
  totalPerPerson: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private STORAGE_KEY = 'splitbill_history';

  constructor() {}

  getHistory(): BillHistory[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        })).sort((a: BillHistory, b: BillHistory) => b.date.getTime() - a.date.getTime());
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  addHistory(history: Omit<BillHistory, 'id' | 'date'>): void {
    const current = this.getHistory();
    const newEntry: BillHistory = {
      ...history,
      id: Date.now().toString(),
      date: new Date()
    };
    current.unshift(newEntry);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
