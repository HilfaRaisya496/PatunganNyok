import { Component, OnInit } from '@angular/core';
import { HistoryService, BillHistory } from '../services/history.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false,
})
export class HistoryPage implements OnInit {
  history: BillHistory[] = [];

  constructor(private historyService: HistoryService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadHistory();
  }

  loadHistory() {
    this.history = this.historyService.getHistory();
  }

  clearHistory() {
    this.historyService.clearHistory();
    this.loadHistory();
  }

  isCustomSplit(item: BillHistory): boolean {
    if (item.splitMode) {
      return item.splitMode === 'custom';
    }
    return !!item.peopleBreakdown?.length;
  }

  hasCustomBreakdown(item: BillHistory): boolean {
    return this.isCustomSplit(item) && !!item.peopleBreakdown?.length;
  }
}
