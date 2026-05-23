import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';
import { TranslateState } from './modules/translate/translate.state';
import { LanguageDetectionService } from './modules/translate/language-detection/language-detection.service';
import { MediaPipeLanguageDetectionService } from './modules/translate/language-detection/mediapipe.service';
import { MainComponent } from './pages/main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/translate/translate.component').then(m => m.TranslateComponent),
        providers: [
          provideStates([TranslateState]),
          { provide: LanguageDetectionService, useClass: MediaPipeLanguageDetectionService },
        ],
      },
      {
        path: 'translate',
        redirectTo: '',
      },
    ],
  },
];
