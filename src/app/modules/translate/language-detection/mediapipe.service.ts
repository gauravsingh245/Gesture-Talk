import { inject, Injectable } from '@angular/core';

import { TranslationService } from '../translate.service';
import { LanguageDetectionService } from './language-detection.service';
import type { LanguageDetector } from '@mediapipe/tasks-text';

@Injectable({
  providedIn: 'root',
})
export class MediaPipeLanguageDetectionService extends LanguageDetectionService {


  private detector: LanguageDetector;

  async init(): Promise<void> {
    if (this.detector) {
      return;
    }

    const textTasks = await import(/* webpackChunkName: "@mediapipe/tasks-text" */ '@mediapipe/tasks-text');

    this.detector = await (async () => {
      const basePath = 'assets/models/mediapipe-language-detector';
      const wasmFiles = await textTasks.FilesetResolver.forTextTasks(basePath);
      return await textTasks.LanguageDetector.createFromModelPath(wasmFiles, `${basePath}/model.tflite`);
    })();
  }

  async detectSpokenLanguage(text: string): Promise<string> {
    if (!this.detector) {
      return this.languageCode(null);
    }

    const { languages } = await this.detector.detect(text);

    if (languages.length === 0) {
      // This usually happens when the text is too short.
      return this.languageCode(null);
    }

    return this.languageCode(languages[0].languageCode);
  }
}
