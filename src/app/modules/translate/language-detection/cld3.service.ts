import { Injectable } from '@angular/core';
import { LanguageIdentifier } from 'cld3-asm';


import { LanguageDetectionService } from './language-detection.service';

@Injectable({
  providedIn: 'root',
})
export class CLD3LanguageDetectionService extends LanguageDetectionService {
  private cld: LanguageIdentifier;

  async init(): Promise<void> {
    if (this.cld) {
      return;
    }
    const cld3 = await import(/* webpackChunkName: "cld3-asm" */ 'cld3-asm');
    const cldFactory = await cld3.loadModule();
    this.cld = await cldFactory.create(1, 500);
  }

  async detectSpokenLanguage(text: string): Promise<string> {
    if (!this.cld) {
      return this.languageCode(null);
    }

    const language = await this.cld.findLanguage(text);
    if (language.is_reliable) {
      return this.languageCode(language.language);
    }

    return this.languageCode(null);
  }
}
