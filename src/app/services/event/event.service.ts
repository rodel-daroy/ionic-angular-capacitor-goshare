import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  geolocationState = new Subject<any>();

  scrapeStep = new Subject<any>();

  createCRUD = new Subject<any>();
  imageDrawing = new Subject<any>();

  executed = new Subject<any>();

  constructor() { }

  geolocationStatePublish(data) {
    this.geolocationState.next(data);
  }

  getGeolocationState(): Subject<any> {
    return this.geolocationState;
  }

  scrapeStepPublish(data) {
    this.scrapeStep.next(data);
  }

  getScrapeStep(): Subject<any> {
    return this.scrapeStep;
  }


  createCRUDPublish(data) {
    this.createCRUD.next(data);
  }

  getCreateCRUD(): Subject<any> {
    return this.createCRUD;
  }

  imageDrawingPublish(data) {
    this.imageDrawing.next(data);
  }

  getImageDrawing(): Subject<any> {
    return this.imageDrawing;
  }

  executedPublish(data) {
    this.executed.next(data);
  }

  getExecuted(): Subject<any> {
    return this.executed;
  }

}
