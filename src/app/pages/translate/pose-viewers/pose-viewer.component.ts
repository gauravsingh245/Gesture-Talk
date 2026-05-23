import { Component, ElementRef, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../components/base/base.component';
import { fromEvent, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';


@Component({
  selector: 'app-pose-viewer',
  template: ``,
  styles: [],
})
export abstract class BasePoseViewerComponent extends BaseComponent implements OnInit, OnDestroy {
  protected store = inject(Store);

  readonly poseEl = viewChild<ElementRef<HTMLPoseViewerElement>>('poseViewer');

  background: string = '';

  cache: ImageBitmap[] = [];
  cacheSubscription: import('rxjs').Subscription;

  frameIndex = 0;

  static isCustomElementDefined = false;

  async ngOnInit() {
    await this.definePoseViewerElement();
  }

  async definePoseViewerElement() {
    // Load the `pose-viewer` custom element
    if (!BasePoseViewerComponent.isCustomElementDefined) {
      BasePoseViewerComponent.isCustomElementDefined = true;

      const { defineCustomElements } = await import(/* webpackChunkName: "pose-viewer" */ 'pose-viewer/loader');
      defineCustomElements();
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    this.reset();
  }

  async fps() {
    const pose = await this.poseEl().nativeElement.getPose();
    return pose.body.fps;
  }

  async addCacheFrame(image: ImageBitmap): Promise<void> {
    this.cache.push(image);
    this.frameIndex++;
  }

  reset(): void {
    if (this.cacheSubscription) {
      this.cacheSubscription.unsubscribe();
    }
    this.cache = [];
  }
}
