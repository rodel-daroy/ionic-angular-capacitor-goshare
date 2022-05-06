import {Injectable} from '@angular/core';

import {EventService} from '../event/event.service';
import {VariableService} from '../data/variable.service';

import {AddressModel, LocationModel} from '../../models/model';

import {Plugins} from '@capacitor/core';

const {Geolocation} = Plugins;

declare let google;

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  userAddress: AddressModel;
  userLocation: LocationModel;

  constructor(private eventService: EventService,
              private variableService: VariableService) {
  }

  getCurrentAddress(): Promise<any> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition()
        .then((coordinates) => {
          this.userLocation = {lat: coordinates.coords.latitude, lng: coordinates.coords.longitude};
          const latLng = new google.maps.LatLng(this.userLocation.lat, this.userLocation.lng);

          const geoCoder = new google.maps.Geocoder();
          const self = this;
          geoCoder.geocode({location: latLng}, (geocoderResults, geocoderStatus) => {
            if (geocoderStatus === google.maps.GeocoderStatus.OK) {
              if (geocoderResults[0]) {

                const addressArray = geocoderResults[0].address_components;
                const formattedAddress = geocoderResults[0].formatted_address;
                const formattedArray = formattedAddress.split(',');
                const formattedCity = formattedArray[formattedArray.length - 3].trim();
                self.variableService.scrapePlaceId = geocoderResults[0].place_id;

                if (addressArray[8]) {
                  if (formattedAddress.split(',').length === 5) {
                    self.userAddress = {
                      country: addressArray[7].short_name,
                      state: addressArray[6].short_name,
                      city: addressArray[4].short_name === formattedCity ? addressArray[4].short_name : formattedCity,
                      zipCode: addressArray[8].short_name
                    };
                  } else {
                    self.userAddress = {
                      country: addressArray[6].short_name,
                      state: addressArray[5].short_name,
                      city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
                      zipCode: addressArray[7].short_name
                    };
                  }
                } else if (addressArray[7]) {
                  self.userAddress = {
                    country: addressArray[6].short_name,
                    state: addressArray[5].short_name,
                    city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
                    zipCode: addressArray[7].short_name
                  };
                } else if (addressArray[6]) {
                  if (addressArray[5].long_name === 'Puerto Rico') {
                    self.userAddress = {
                      country: 'US',
                      state: addressArray[5].short_name,
                      city: addressArray[3].short_name === formattedCity ? addressArray[3].short_name : formattedCity,
                      zipCode: addressArray[6].short_name
                    };
                  } else {
                    self.userAddress = {
                      country: addressArray[5].short_name,
                      state: addressArray[4].short_name,
                      city: addressArray[2].short_name === formattedCity ? addressArray[2].short_name : formattedCity,
                      zipCode: addressArray[6].short_name
                    };
                  }
                } else if (addressArray[5]) {
                  self.userAddress = {
                    country: addressArray[4].short_name,
                    state: addressArray[3].short_name,
                    city: addressArray[1].short_name === formattedCity ? addressArray[1].short_name : formattedCity,
                    zipCode: addressArray[5].short_name
                  };
                } else if (addressArray[2]) {
                  self.userAddress = {
                    country: addressArray[2].short_name,
                    state: addressArray[1].short_name,
                    city: addressArray[0].short_name === formattedCity ? addressArray[0].short_name : formattedCity,
                    zipCode: ''
                  };
                }

                if (self.userAddress.country === 'US') {
                  self.userAddress.country = 'USA';
                }

                self.variableService.userAddress = self.userAddress;
                self.variableService.userLocation = self.userLocation;
                self.variableService.scrapeAddress = self.userAddress;
                self.variableService.scrapeLocation = self.userLocation;
                self.variableService.scrapePlaceId = geocoderResults[0].place_id;

                this.eventService.geolocationStatePublish({success: true});
                resolve(self.userAddress);
              }
            } else {
              this.eventService.geolocationStatePublish({success: false, error: 'geocoder'});
              reject();
            }
          });
        })
        .catch(() => {
          this.eventService.geolocationStatePublish({success: false, error: 'geolocation'});
          reject();
        });
    });
  }

}
