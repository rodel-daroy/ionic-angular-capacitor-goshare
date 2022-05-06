import {Component, ElementRef, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-google-map',
  template: '<div id="map" #map style="width: 100%; height: 100%"></div>'
})
export class GoogleMapComponent implements OnInit {

  @Input() mapOptions: google.maps.MapOptions;
  @ViewChild('map', {static: true}) mapElement: ElementRef;
  public map: google.maps.Map;
  public $mapReady: EventEmitter<any> = new EventEmitter();
  public mapIdledOnce = false;

  constructor() {
  }

  ngOnInit() {
    this.initMap();
  }

  initMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, this.mapOptions);

    const readyListener = this.map.addListener('idle', () => {
      if (!this.mapIdledOnce) {
        this.$mapReady.emit(this.map);
        this.mapIdledOnce = true;
        google.maps.event.removeListener(readyListener);
      }
    });
  }

}
