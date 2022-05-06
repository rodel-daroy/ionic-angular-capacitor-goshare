import {Injectable} from '@angular/core';

import {AddressModel, LocationModel} from '../../models/model';

import {AllScrapeSites} from '../../app.constant';

@Injectable({
  providedIn: 'root'
})
export class VariableService {

  userAddress: AddressModel;
  userLocation: LocationModel;

  scrapeAddress: AddressModel;
  scrapeLocation: LocationModel;
  scrapePlaceId: string;

  scrapingState = false;
  currentScrapingSite;

  scrapeItemsLimit = 10;
  radius = 40;

  selectedScrapeSites = [];

  noAvatar = '/assets/user/default-profile-pic.jpg';
  emptyImage = 'https://firebasestorage.googleapis.com/v0/b/goshare360.appspot.com/o/brand%2Fui%2Fcolorful%2F07.jpg?alt=media&token=3a1209af-e1f0-49bf-ac13-d91cb87e5a20';

  imageDrawingType: string;
  imageDrawingIndex: number;
  imageDrawingSrc;

  constructor() {
    this.selectedScrapeSites = AllScrapeSites;
  }
}
