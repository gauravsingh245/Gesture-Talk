import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '../../../../components/base/base.component';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { SkeletonPoseViewerComponent } from '../../pose-viewers/skeleton-pose-viewer/skeleton-pose-viewer.component';
import { AsyncPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-signed-language-output',
  templateUrl: './signed-language-output.component.html',
  styleUrls: ['./signed-language-output.component.scss'],
  imports: [
    IonButton,
    IonIcon,
    SkeletonPoseViewerComponent,
    AsyncPipe,
    MatTooltipModule,
  ],
})
export class SignedLanguageOutputComponent extends BaseComponent implements OnInit {
  private store = inject(Store);
  private domSanitizer = inject(DomSanitizer);

  pose$!: Observable<string>;
  text$!: Observable<string>;

  constructor() {
    super();
    this.pose$ = this.store.select<string>(state => state.translate.signedLanguagePose);
    this.text$ = this.store.select<string>(state => state.translate.spokenLanguageText);

    addIcons({ refreshOutline });
  }

  ngOnInit(): void {
  }

  replayAnimation(skeletonViewer: SkeletonPoseViewerComponent): void {
    if (skeletonViewer && skeletonViewer.poseEl && skeletonViewer.poseEl().nativeElement) {
      const poseElement = skeletonViewer.poseEl().nativeElement;
      poseElement.currentTime = 0;
      poseElement.play();
    }
  }
}
