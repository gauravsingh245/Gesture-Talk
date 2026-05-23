import { Component, Input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { fromEvent } from 'rxjs';
import { BaseComponent } from '../base/base.component';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { TranslocoDirective } from '@jsverse/transloco';
import { addIcons } from 'ionicons';
import { micOffOutline, micOutline, stopCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  imports: [IonButton, IonIcon, MatTooltipModule, TranslocoDirective],
})
export class SpeechToTextComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() lang = 'en';
  readonly changeText = output<string>();
  @Input() matTooltipPosition: TooltipPosition = 'above';

  SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  speechRecognition!: SpeechRecognition;

  supportError = null;
  isRecording = false;

  constructor() {
    super();

    addIcons({ stopCircleOutline, micOutline, micOffOutline });
  }

  getRecognitionLang(lang: string): string {
    const map: { [key: string]: string } = {
      hi: 'hi-IN',
      en: 'en-US',
      bn: 'bn-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      ur: 'ur-PK',
    };
    return map[lang] || lang;
  }

  ngOnInit(): void {
    if (!this.SpeechRecognition) {
      this.supportError = 'browser-not-supported';
      return;
    }

    this.speechRecognition = new this.SpeechRecognition();
    this.speechRecognition.interimResults = true;
    this.speechRecognition.continuous = false;
    this.speechRecognition.lang = this.getRecognitionLang(this.lang);

    fromEvent(this.speechRecognition, 'result').subscribe((event: SpeechRecognitionEvent) => {
      const transcription = event.results[0][0].transcript;
      this.changeText.emit(transcription);
    });

    fromEvent(this.speechRecognition, 'error').subscribe((event: SpeechRecognitionErrorEvent) => {
      console.error('Speech Recognition Error:', event.error);

      if (['not-allowed', 'language-not-supported', 'service-not-allowed', 'network', 'no-speech'].includes(event.error)) {
        this.supportError = event.error;
      } else {
        this.supportError = null;
      }

      // Try accessing microphone, to request permission
      if (event.error === 'not-allowed') {
        this.requestPermission();
      }
    });

    fromEvent(this.speechRecognition, 'start').subscribe(() => {
      console.error('start');

      this.changeText.emit('');
      this.isRecording = true;
    });

    // TODO: ongoing safari bug: on end, microphone is still active
    // https://stackoverflow.com/questions/75498609/safari-webkitspeechrecognition-continuous-bug
    fromEvent(this.speechRecognition, 'end').subscribe(() => {
      this.isRecording = false;
      this.speechRecognition.stop(); // Explicitly stop the recognition service, to disengage the microphone
    });

    fromEvent(this.speechRecognition, 'speechend').subscribe(this.stop.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.lang && this.speechRecognition) {
      this.speechRecognition.lang = this.getRecognitionLang(this.lang);
    }
  }

  requestPermission() {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
      stream.getTracks().forEach(track => track.stop());
      this.supportError = null;
    });
  }

  async start() {
    this.supportError = null;
    try {
      // Ensure we have permission and hardware is "warmed up"
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      // Small delay to avoid race conditions with hardware/permissions
      await new Promise(resolve => setTimeout(resolve, 500));

      this.speechRecognition.start();
    } catch (e) {
      this.supportError = 'not-allowed';
      console.error('Microphone access denied:', e);
    }
  }

  stop() {
    this.speechRecognition.stop();
  }
}
