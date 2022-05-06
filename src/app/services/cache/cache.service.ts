import {Injectable} from '@angular/core';

import {Plugins} from '@capacitor/core';

const {Storage} = Plugins;

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  user;

  scrapeHistory;

  constructor() {
  }

  async setFirstLogin(data) {
    await Storage.set({
      key: 'gs360_firstLogin',
      value: JSON.stringify(data)
    });
  }

  async getFirstLogin() {
    const ret = await Storage.get({key: 'gs360_firstLogin'});
    return JSON.parse(ret.value);
  }

  async setAutoLogin(data) {
    await Storage.set({
      key: 'gs360_autoLogin',
      value: JSON.stringify(data)
    });
  }

  async getAutoLogin() {
    const ret = await Storage.get({key: 'gs360_autoLogin'});
    return JSON.parse(ret.value);
  }

  async setFcmToken(data) {
    await Storage.set({
      key: 'gs360_fcmToken',
      value: JSON.stringify(data)
    });
  }

  async getFcmToken() {
    const ret = await Storage.get({key: 'gs360_fcmToken'});
    return JSON.parse(ret.value);
  }

  async setTour(data) {
    await Storage.set({
      key: 'gs360_tour',
      value: JSON.stringify(data)
    });
  }

  async getTour() {
    const ret = await Storage.get({key: 'gs360_tour'});
    return JSON.parse(ret.value);
  }


  async setUser(data) {
    this.user = data;
    await Storage.set({
      key: 'gs360_user',
      value: JSON.stringify(data)
    });
  }

  async getUser() {
    const ret = await Storage.get({key: 'gs360_user'});
    this.user = JSON.parse(ret.value);
    return JSON.parse(ret.value);
  }

  async updateUser(uid: string) {
  }

  async removeUser() {
    this.user = null;
    await Storage.remove({key: 'gs360_user'});
  }

  async setSites(data) {
    await Storage.set({
      key: 'gs360_sites',
      value: JSON.stringify(data)
    });
  }

  async getSites() {
    const ret = await Storage.get({key: 'gs360_sites'});
    return JSON.parse(ret.value);
  }

  async setScrapeHistory(data) {
    const ret = await Storage.get({key: 'gs360_scrapeHistory'});
    let scrapeHistoryArray = JSON.parse(ret.value);
    if (!scrapeHistoryArray) {
      scrapeHistoryArray = [];
      scrapeHistoryArray.push(data);
      await Storage.set({
        key: 'gs360_scrapeHistory',
        value: JSON.stringify(scrapeHistoryArray)
      });
    } else {
      scrapeHistoryArray.push(data);
      await Storage.set({
        key: 'gs360_scrapeHistory',
        value: JSON.stringify(scrapeHistoryArray)
      });
    }
    return;
  }

  async getScrapeHistory() {
    const ret = await Storage.get({key: 'gs360_scrapeHistory'});
    return JSON.parse(ret.value) ? JSON.parse(ret.value) : [];
  }

  async removeScrapeHistoryItem(index: number) {
    const ret = await Storage.get({key: 'gs360_scrapeHistory'});
    const scrapeHistoryArray = JSON.parse(ret.value);
    scrapeHistoryArray.splice(index, 1);
    this.scrapeHistory = scrapeHistoryArray;
    await Storage.set({
      key: 'gs360_scrapeHistory',
      value: JSON.stringify(scrapeHistoryArray)
    });
  }

  async removeScrapeHistory() {
    this.scrapeHistory = [];
    await Storage.remove({key: 'gs360_scrapeHistory'});
  }


  async clearCache() {
    await Storage.clear();
  }

}
