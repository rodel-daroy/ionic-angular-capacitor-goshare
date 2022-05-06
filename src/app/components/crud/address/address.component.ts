import {AfterViewInit, EventEmitter, Component, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';

import {ModalController, Platform} from '@ionic/angular';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
})
export class AddressComponent implements OnInit, AfterViewInit {

  locationAddress = '';
  locationDescription = '';
  locationFilter = 'private';
  latLng = {};

  itineraryList: any = [];

  @Output() setAddress1: EventEmitter<any> = new EventEmitter();
  @ViewChild('addressText1') addressText1: any;

  constructor(private formBuilder: FormBuilder,
              private platform: Platform,
              public modalController: ModalController) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getPlaceAutocomplete1();
  }


  private getPlaceAutocomplete1() {
    const autocomplete1 = new google.maps.places.Autocomplete(this.addressText1.nativeElement, {types: ['geocode']});
    google.maps.event.addListener(autocomplete1, 'place_changed', () => {
      const place1 = autocomplete1.getPlace();
      this.locationAddress = place1.formatted_address;
      const lat = autocomplete1.getPlace().geometry.location.lat();
      const lng = autocomplete1.getPlace().geometry.location.lng();
      this.latLng = {lat, lng};
      this.invokeEvent1(place1);
    });
  }

  invokeEvent1(place: any) {
    this.setAddress1.emit(place);
  }

  locationRadioChange(event) {
    this.locationFilter = event.value;
  }

  addOnlyOne() {
    const locationItem = {
      formatted_address: this.locationAddress,
      filter: this.locationFilter,
      latLng: this.latLng,
    };
    this.itineraryList.push(locationItem);
    this.modalController.dismiss(this.itineraryList).then();
  }

}
