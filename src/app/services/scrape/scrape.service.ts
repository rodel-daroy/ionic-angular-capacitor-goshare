import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {CacheService} from '../cache/cache.service';
import {EventService} from '../event/event.service';
import {VariableService} from '../data/variable.service';

@Injectable({
  providedIn: 'root'
})
export class ScrapeService {

  keyword = '';
  address: any = {};

  selectedSites = [];
  scrapedSites = [];
  scrapedItems = [];

  SCRAPE_HOST1 = 'https://us-central1-goshare360.cloudfunctions.net/scrape/scraper';
  SCRAPE_HOST2 = 'https://us-central1-goshare360.cloudfunctions.net/scrape1/scraper';
  SCRAPE_HOST3 = 'https://us-central1-goshare360.cloudfunctions.net/scrape2/scraper';
  SCRAPE_HOST4 = 'https://us-central1-goshare360.cloudfunctions.net/scrape3/scraper';
  SCRAPE_HOST5 = 'https://us-central1-goshare360.cloudfunctions.net/scrape4/scraper';
  SCRAPE_HOST6 = 'https://us-central1-goshare360.cloudfunctions.net/scrape5/scraper';

  constructor(private httpClient: HttpClient,
              private cacheService: CacheService,
              private eventService: EventService,
              private variableService: VariableService) {
  }

  startScraping() {

    this.selectedSites = this.variableService.selectedScrapeSites;
    this.scrapedSites = [];
    this.scrapedItems = [];

    if (this.selectedSites.length > 0) {

      const self = this;

      this.selectedSites.reduce((p, site) => p.then(() => {
          if (self.variableService.scrapingState) {
            return self.scrapingSites(site).then(resp => self.scrapingInProgress(site, resp));
          }
        }), Promise.resolve()).then();

    } else {
      this.variableService.scrapingState = false;
    }
  }

  scrapingSites(site): Promise<any> {

    this.variableService.currentScrapingSite = site;

    let host: string = this.SCRAPE_HOST1;

    if (site.siteId > 8) {
      host = this.SCRAPE_HOST2;
    }
    if (site.siteId > 17) {
      host = this.SCRAPE_HOST3;
    }
    if (site.siteId > 26) {
      host = this.SCRAPE_HOST4;
    }
    if (site.siteId > 35) {
      host = this.SCRAPE_HOST5;
    }
    if (site.siteId > 44) {
      host = this.SCRAPE_HOST6;
    }

    return new Promise(resolve => {
      this.scrapeData(host, site.siteId, this.address, this.variableService.scrapePlaceId, this.variableService.scrapeLocation, this.keyword, this.variableService.scrapeItemsLimit)
        .then(resp => resolve(resp));
    });
  }

  async scrapeData(endpoint: string, siteId: number, scrapeAddress, placeId, currentPosition, keyword, limit): Promise<any> {

    if (this.variableService.scrapingState) {
      const scrapeSiteUrl = endpoint + '?siteId=' + siteId + '&country=' + scrapeAddress?.country + '&state=' + scrapeAddress?.state + '&city=' + scrapeAddress?.city
        + '&placeId=' + placeId + '&lat=' + currentPosition?.lat + '&lng=' + currentPosition?.lng + '&keyword=' + keyword + '&limit=' + limit;

      return new Promise<any>(resolve => {
        this.httpClient.get(scrapeSiteUrl).subscribe(
          (resp: any) => {
            if (resp.city) {
              resolve(resp);
            } else {
              resolve({result: [], city: this.address?.city});
            }
          },
          () => resolve({result: [], city: this.address?.city}));
      });
    } else {
      return new Promise<any>(resolve => resolve({result: [], city: this.address?.city}));
    }
  }

  scrapingInProgress(site, scrapedData) {

    if (this.variableService.scrapingState) {

      if ((scrapedData.city === this.address?.city) || (scrapedData.city === 'undefined')) {


        this.scrapedSites = this.scrapedSites.filter(item => item.siteId !== site.siteId);

        this.scrapedSites.push({
          siteId: site.siteId,
          name: site.name,
          logo: site.logo,
          siteURL: site.siteURL,
          description: site.description,
          category: site.category,
          data: scrapedData.result,
          size: scrapedData.result.length,
          local: site.local
        });

        this.scrapedItems = this.scrapedItems.concat(scrapedData.result);
      }

      if (site.siteId === this.selectedSites[this.selectedSites.length - 1].siteId) {

        const scrapeHistory = {
          keyword: this.keyword,
          address: this.address,
          location: this.variableService.scrapeLocation,
          data: this.scrapedSites,
          size: this.scrapedItems.length,
          date: new Date()
        };

        this.cacheService.setScrapeHistory(scrapeHistory).then();
        this.variableService.scrapingState = false;
      }

      this.eventService.scrapeStepPublish({all: this.scrapedItems, one: scrapedData.result});
    }
  }

  stopScraping() {

    const scrapeHistory = {
      keyword: this.keyword,
      address: this.address,
      location: this.variableService.scrapeLocation,
      data: this.scrapedSites,
      size: this.scrapedItems.length,
      date: new Date()
    };

    this.cacheService.setScrapeHistory(scrapeHistory).then();
  }

}
