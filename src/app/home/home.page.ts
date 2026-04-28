import { Component } from '@angular/core';
import { Share } from '@capacitor/share';
import { HistoryService } from '../services/history.service';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Person, SplitItem } from '../models/split-item.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  splitMode: 'even' | 'custom' = 'even';

  billAmount: number = 0;
  numPeople: number = 1;
  tipPercent: number = 0;
  servicePercent: number = 0;
  roundResult: boolean = false;
  people: Person[] = [
    this.createPerson('Orang 1'),
    this.createPerson('Orang 2'),
  ];
  showItemDetailsInReceipt: boolean = true;

  constructor(private historyService: HistoryService) { }
  get totalPerPerson(): number {
    const base = this.billAmount;
    const tipAmount = (base * this.tipPercent) / 100;
    const serviceAmount = (base * this.servicePercent) / 100;
    const total = base + tipAmount + serviceAmount;
    let per = total / (this.numPeople || 1);
    if (this.roundResult) {
      per = Math.ceil(per);
    }
    return per;
  }
  private createPerson(name: string): Person {
    return {
      id: Date.now().toString() + Math.random(),
      name,
      items: [],
    };
  }

  addPerson() {
    this.people.push(this.createPerson(`Orang ${this.people.length + 1}`));
  }

  removePerson(personId: string) {
    if (this.people.length <= 1) return;
    this.people = this.people.filter((p) => p.id !== personId);
  }

  addItem(person: Person) {
    person.items.push({
      id: Date.now().toString() + Math.random(),
      name: '',
      price: 0,
    });
  }

  removeItem(person: Person, itemId: string) {
    person.items = person.items.filter((i) => i.id !== itemId);
  }

  private personItemCount(person: Person): number {
    return person.items.filter((i) => (i.price || 0) > 0 || (i.name || '').trim().length > 0).length;
  }

  personSubtotal(person: Person): number {
    return person.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  get customGrandTotal(): number {
    return this.people.reduce((sum, p) => sum + this.personSubtotal(p), 0);
  }

  get customTipAmount(): number {
    return (this.customGrandTotal * this.tipPercent) / 100;
  }
  
  get customServiceAmount(): number {
    return (this.customGrandTotal * this.servicePercent) / 100;
  }

  get customTotalWithFees(): number {
    return this.customGrandTotal + this.customTipAmount + this.customServiceAmount;
  }

  personTipAmount(person: Person): number {
    const sub = this.personSubtotal(person);
    const grand = this.customGrandTotal || 1;
    return this.customTipAmount * (sub / grand);
  }

  personServiceAmount(person: Person): number {
    const sub = this.personSubtotal(person);
    const grand = this.customGrandTotal || 1;
    return this.customServiceAmount * (sub / grand);
  }

  personTotal(person: Person): number {
    const sub = this.personSubtotal(person);
    const tip = this.personTipAmount(person);
    const service = this.personServiceAmount(person);
    let total = sub + tip + service;
    if (this.roundResult) {
      total = Math.ceil(total);
    }
    return total;
  }

  trackByPersonId(_: number, p: Person) { return p.id; }
  trackByItemId(_: number, i: SplitItem) { return i.id; }
  saveToHistory() {
    if (this.splitMode === 'even') {
      this.historyService.addHistory({
        totalBill: this.billAmount,
        numPeople: this.numPeople,
        splitMode: 'even',
        tipPercent: this.tipPercent,
        servicePercent: this.servicePercent,
        totalPerPerson: this.totalPerPerson,
      });
    } else {
      const peopleBreakdown = this.people.map((person) => ({
        name: person.name,
        itemCount: this.personItemCount(person),
        subtotal: this.personSubtotal(person),
        total: this.personTotal(person),
      }));

      this.historyService.addHistory({
        totalBill: this.customTotalWithFees,
        numPeople: this.people.length,
        splitMode: 'custom',
        tipPercent: this.tipPercent,
        servicePercent: this.servicePercent,
        tipAmount: this.customTipAmount,
        serviceAmount: this.customServiceAmount,
        peopleBreakdown,
        // Keep a backward-compatible numeric field while custom UI uses peopleBreakdown.
        totalPerPerson: this.customTotalWithFees,
      });
    }
  }

  async shareResult() {
    this.saveToHistory();

    const receiptElement = document.getElementById('receipt-template');
    if (!receiptElement) {
      await this.shareTextOnly();
      return;
    }

    try {
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const base64Data = canvas.toDataURL('image/jpeg', 0.9);

      if (Capacitor.isNativePlatform()) {
        const fileName = `patungannyok_struk_${new Date().getTime()}.jpg`;
        const base64ImageStr = base64Data.split(',')[1];

        await Filesystem.writeFile({
          path: fileName,
          data: base64ImageStr,
          directory: Directory.Cache,
        });

        const fileUri = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'Struk PatunganNyok',
          text: 'Berikut adalah rincian tagihan kita!',
          url: fileUri.uri,
          dialogTitle: 'Bagikan Struk PatunganNyok',
        });
      } else {
        const res = await fetch(base64Data);
        const blob = await res.blob();
        const file = new File([blob], 'patungannyok-struk.jpg', { type: 'image/jpeg' });

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            title: 'Struk PatunganNyok',
            text: 'Berikut adalah rincian tagihan kita!',
            files: [file],
          });
        } else {
          await this.shareTextOnly();
        }
      }
    } catch (err) {
      console.error('Error generating receipt', err);
      await this.shareTextOnly();
    }
  }

  private async shareTextOnly() {
    let text = '';
    if (this.splitMode === 'even') {
      text = `Setiap orang harus membayar: Rp ${this.totalPerPerson.toFixed(0)}`;
    } else {
      text = this.people
        .map((p) => `${p.name}: Rp ${this.personTotal(p).toFixed(0)}`)
        .join('\n');
      text = `Rincian tagihan:\n${text}\nTotal: Rp ${this.customTotalWithFees.toFixed(0)}`;
    }

    if (navigator.share && !Capacitor.isNativePlatform()) {
      try {
        await navigator.share({ title: 'PatunganNyok', text });
        return;
      } catch (err) {
        console.error('Web share failed', err);
      }
    }

    try {
      await Share.share({ title: 'PatunganNyok', text });
    } catch (err) {
      console.error('Capacitor share failed', err);
      alert(text);
    }
  }
}
