import {Component, NgZone, OnInit} from '@angular/core';

import {ModalController} from '@ionic/angular';

import {UtilService} from '../../../services/util/util.service';

import {Plugins} from '@capacitor/core';

const {Geolocation} = Plugins;

declare let google;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {

  GoogleAutocomplete: google.maps.places.AutocompleteService;
  googleAutocomplete: { location: string };
  googleAutocompleteItems = [];

  selectedAddress;
  selectedLocation;
  selectedPlaceId;

  constructor(private zone: NgZone,
              public modalController: ModalController,
              private utilService: UtilService) {

    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.googleAutocomplete = {location: ''};
    this.googleAutocompleteItems = [];
  }

  ngOnInit() {
  }


  typingLocation(event) {
    if (event.target.value.length < 3) {
      this.googleAutocompleteItems = [];
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions({input: event.target.value}, autocompletePredictions => {
      this.googleAutocompleteItems = [];
      this.zone.run(() => autocompletePredictions.forEach(autocompletePrediction => this.googleAutocompleteItems.push(autocompletePrediction)));
    });
  }

  selectSearchLocation(prediction) {

    this.googleAutocomplete.location = prediction.description;

    const addressArray = prediction.description.split(', ');

    this.selectedAddress = {
      country: addressArray[addressArray.length - 1],
      state: addressArray[addressArray.length - 2],
      zipCode: '',
      city: addressArray[addressArray.length - 3]
    };

    this.geoCode(this.googleAutocomplete.location).then(resp => {
      this.selectedLocation = resp.location;
      this.selectedPlaceId = resp.place_id;
      this.modalController.dismiss({
        scrapeAddress: this.selectedAddress,
        scrapeLocation: this.selectedLocation,
        scrapePlaceId: this.selectedPlaceId
      }).then();
    });
  }

  geoCode(address): Promise<any> {

    const geocoder = new google.maps.Geocoder();

    return new Promise<any>(resolve => {
      geocoder.geocode({address}, (results, status) => {
        if (status === 'OK') {
          const latitude = parseFloat(results[0].geometry.location.lat());
          const longitude = parseFloat(results[0].geometry.location.lng());
          const place_id = results[0].place_id;
          const location = {lat: latitude, lng: longitude};
          resolve({location, place_id});
        }
      });
    });
  }

  userMyLocation() {
    this.utilService.presentLoading(1000).then();
    Geolocation.getCurrentPosition()
      .then(geoPosition => {

        const currentPosition = {lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude};
        this.getAddress(currentPosition.lat, currentPosition.lng).then(resp => {

          const addressArray = resp.address_components;
          const locationAddress = resp.formatted_address;
          const formattedArray = locationAddress.split(',');
          const formattedCity = formattedArray[formattedArray.length - 3].trim();
          this.selectedLocation = currentPosition;
          this.selectedPlaceId = resp.place_id;

          if (addressArray[8]) {
            if (locationAddress.split(',').length === 5) {
              this.selectedAddress = {
                country: addressArray[7].short_name,
                state: addressArray[6].short_name,
                city: addressArray[4].short_name === formattedCity ? addressArray[4].short_name : formattedCity,
                zipCode: addressArray[8].short_name
              };
            } else {
              this.selectedAddress = {
                country: addressArray[6].short_name,
                state: addressArray[5].short_name,
                city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
                zipCode: addressArray[7].short_name
              };
            }
          } else if (addressArray[7]) {
            this.selectedAddress = {
              country: addressArray[6].short_name,
              state: addressArray[5].short_name,
              city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
              zipCode: addressArray[7].short_name
            };
          } else if (addressArray[6]) {
            this.selectedAddress = {
              country: addressArray[5].short_name,
              state: addressArray[4].short_name,
              city: addressArray[2].short_name === formattedCity ? addressArray[2].short_name : formattedCity,
              zipCode: addressArray[6].short_name
            };
          } else if (addressArray[5]) {
            this.selectedAddress = {
              country: addressArray[4].short_name,
              state: addressArray[3].short_name,
              city: addressArray[1].short_name === formattedCity ? addressArray[1].short_name : formattedCity,
              zipCode: addressArray[5].short_name
            };
          } else if (addressArray[2]) {
            this.selectedAddress = {
              country: addressArray[2].short_name,
              state: addressArray[1].short_name,
              city: addressArray[0].short_name === formattedCity ? addressArray[0].short_name : formattedCity,
              zipCode: ''
            };
          }

          this.modalController.dismiss({
            scrapeAddress: this.selectedAddress,
            scrapeLocation: this.selectedLocation,
            scrapePlaceId: this.selectedPlaceId
          }).then();
        });
      });
  }

  getAddress(latitude, longitude): Promise<any> {

    return new Promise((resolve, reject) => {

      const request = new XMLHttpRequest();

      const method = 'GET';
      const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true&key=';
      const async = true;

      request.open(method, url, async);
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 200) {
            const data = JSON.parse(request.responseText);
            const address = data.results[0];
            resolve(address);
          } else {
            reject(request.status);
          }
        }
      };
      request.send();
    });
  }

}
