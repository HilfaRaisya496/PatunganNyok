import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage {

  constructor(public theme: ThemeService) {}

  toggleTheme(event: any) {
    this.theme.toggleDark(event.detail.checked);
  }

}