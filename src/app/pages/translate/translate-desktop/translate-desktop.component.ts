import { Component } from '@angular/core';
import { BaseComponent } from '../../../components/base/base.component';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { LanguageSelectorsComponent } from '../language-selectors/language-selectors.component';
import { SpokenToSignedComponent } from '../spoken-to-signed/spoken-to-signed.component';
import { addIcons } from 'ionicons';
import { language, moonOutline, sunnyOutline, moon, sunny } from 'ionicons/icons';

@Component({
  selector: 'app-translate-desktop',
  templateUrl: './translate-desktop.component.html',
  styleUrls: ['./translate-desktop.component.scss'],
  imports: [
    SpokenToSignedComponent,
    LanguageSelectorsComponent,
    IonContent,
    IonIcon,
  ],
})
export class TranslateDesktopComponent extends BaseComponent {
  isDarkMode = false;

  constructor() {
    super();
    addIcons({ language, moonOutline, sunnyOutline, moon, sunny });
    this.initTheme();
  }

  initTheme() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const saved = localStorage.getItem('theme');
    if (saved) {
      this.isDarkMode = saved === 'dark';
    } else if (typeof window !== 'undefined') {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  private applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    }
  }
}
