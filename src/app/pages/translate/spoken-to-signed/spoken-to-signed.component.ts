import { Component } from '@angular/core';
import { SpokenLanguageInputComponent } from './spoken-language-input/spoken-language-input.component';

import { SignedLanguageOutputComponent } from './signed-language-output/signed-language-output.component';

@Component({
  selector: 'app-spoken-to-signed',
  templateUrl: './spoken-to-signed.component.html',
  styleUrls: ['./spoken-to-signed.component.scss'],
  imports: [SpokenLanguageInputComponent, SignedLanguageOutputComponent],
})
export class SpokenToSignedComponent { }
