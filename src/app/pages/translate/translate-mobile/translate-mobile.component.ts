import { Component } from '@angular/core';
import { TranslateDesktopComponent } from '../translate-desktop/translate-desktop.component';
import { IonContent, IonFooter } from '@ionic/angular/standalone';
import { SignedLanguageOutputComponent } from '../spoken-to-signed/signed-language-output/signed-language-output.component';
import { SpokenLanguageInputComponent } from '../spoken-to-signed/spoken-language-input/spoken-language-input.component';

@Component({
  selector: 'app-translate-mobile',
  templateUrl: './translate-mobile.component.html',
  styleUrls: ['./translate-mobile.component.scss'],
  imports: [
    IonContent,
    IonFooter,
    SignedLanguageOutputComponent,
    SpokenLanguageInputComponent,
  ],
})
export class TranslateMobileComponent extends TranslateDesktopComponent { }
