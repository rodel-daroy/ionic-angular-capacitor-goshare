import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFireStorage} from '@angular/fire/storage';

import {DATABASE, FIRESTORE} from '../../../app.constant';

import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  usersRef;
  favouriteRef;
  adminRef;

  crudCollection;
  connectionCollection;
  actionCollection;
  requestCollection;
  requestConnectionCollection;

  constructor(private angularFirestore: AngularFirestore,
              private angularFireDatabase: AngularFireDatabase,
              private angularFireStorage: AngularFireStorage) {

    this.usersRef = this.angularFireDatabase.database.ref(DATABASE.USERS);
    this.favouriteRef = this.angularFireDatabase.database.ref(DATABASE.FAVOURITE);
    this.adminRef = this.angularFireDatabase.database.ref(DATABASE.ADMIN);

    this.crudCollection = this.angularFirestore.firestore.collection(FIRESTORE.CRUD);
    this.connectionCollection = this.angularFirestore.firestore.collection(FIRESTORE.CONNECTION);
    this.actionCollection = this.angularFirestore.firestore.collection(FIRESTORE.ACTION);
    this.requestCollection = this.angularFirestore.firestore.collection(FIRESTORE.REQUEST);
    this.requestConnectionCollection = this.angularFirestore.firestore.collection(FIRESTORE.REQUEST_CONNECTION);
  }

  async addNewUser(data): Promise<any> {
    return this.usersRef.child(data.uid).set(data);
  }

  async getUser(uid: string): Promise<any> {
    const userValue = await this.usersRef.child(uid).once('value');
    return {uid, ...userValue.val()};
  }

  updateUser(uid: string, data) {
    return new Promise(resolve => {
      resolve(this.usersRef.child(uid).update(data));
    });
  }

  uploadImage(imageData: string, format: string, ref: string): Promise<any> {

    const storageRef = this.angularFireStorage.storage.ref(`${ref}`);
    const fileName = this.generateUUID() + `-item.${format}`;

    return new Promise((resolve, reject) => {
      storageRef.child(fileName).putString(imageData, 'base64', {contentType: `image/${format}`}).then(() => {
        storageRef.child(fileName).getDownloadURL().then(url => {
          resolve({imageUrl: url, fileName});
        }).catch(err => reject(err));
      }, err => reject(err));
    });
  }

  generateUUID(): any {

    let d = new Date().getTime();

    return 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
      // eslint-disable-next-line no-bitwise
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // eslint-disable-next-line no-bitwise
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  async getBlockedUsers(uid: string): Promise<any> {

    const blockedUsers = [];

    const userSnapshot = await this.usersRef.child(uid).once('value');
    const blockedUids = userSnapshot.val().blocked;

    if (blockedUids && blockedUids.length > 0) {
      for (const blockedUid of blockedUids) {
        const blockedUserSnapshot = await this.usersRef.child(blockedUid).once('value');
        blockedUsers.push({...blockedUserSnapshot.val(), uid: blockedUid});
      }
    }

    return blockedUsers;
  }

  async unBlockUser(uid: string, unBlockUid: string): Promise<any> {

    const userSnapshot = await this.usersRef.child(uid).once('value');
    let blockedUids = userSnapshot.val().blocked;

    blockedUids = blockedUids.filter(item => item !== unBlockUid);

    this.usersRef.child(uid).update({blocked: blockedUids});

    return;
  }

  updateProfile(uid: string, updatedProfile) {

    const userRef = this.angularFireDatabase.database.ref(`${DATABASE.USERS}/${uid}`);

    return new Promise((resolve, reject) => {
      userRef.update(updatedProfile).then(() => resolve()).catch(err => reject(err));
    });
  }

  async getPublicUser(username): Promise<any> {

    let user;

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    for (const key in usersVal) {
      if (usersVal.hasOwnProperty(key)) {
        if (usersVal[key].username === username.split('_').join(' ')) {
          user = {uid: key, ...usersVal[key]};
        }
      }
    }

    return user;
  }

  updateMembership(uid: string, type: string) {
    return this.usersRef.child(uid).update({membership: type});
  }

  updateVerification(uid: string, type: string) {
    return this.usersRef.child(uid).update({verifyStatus: type});
  }

  async submitVerification(uid: string, verifyData: any): Promise<any> {
    return new Promise(resolve => [
      resolve(this.usersRef.child(uid).update({verifyStatus: 'pending', verifyData}))
    ]);
  }


  async myItems(uid: string): Promise<any> {

    const approvedCruds: any[] = [];
    const pendingCruds: any[] = [];
    const unListCruds: any[] = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    const user = {uid, ...usersVal[uid]};

    const crudSnapshot = await this.crudCollection.get();

    for (const doc of crudSnapshot.docs) {
      if (doc.data().uid === uid) {
        if (doc.data()?.archived) {
          unListCruds.push({id: doc.id, ...doc.data(), user});
        } else {
          if (!doc.data().live) {
            pendingCruds.push({id: doc.id, ...doc.data(), user});
          } else {
            if (doc.data().live === 'approve') {
              approvedCruds.push({id: doc.id, ...doc.data(), user});
            }
          }
        }
      }
    }

    return {approved: approvedCruds, pending: pendingCruds, unList: unListCruds};
  }

  denyBook(crud, index) {

    const crudDoc = this.crudCollection.doc(crud.id);

    return new Promise((resolve, reject) => {
      crudDoc.get().then((value) => {
        const bookList = crud.book_list;
        bookList[index].book_state = 'denied';
        resolve(crudDoc.update({...value.data(), book_list: bookList}));
      }).catch(err => reject(err));
    });
  }

  saveContactInfo(crud, contactSettings, role, index?) {

    const crudDoc = this.crudCollection.doc(crud.id);

    return new Promise((resolve, reject) => {
      crudDoc.get().then((value) => {
        if (role === 'host') {
          resolve(crudDoc.update({...value.data(), host_contact_settings: contactSettings}));
        } else {
          const contactSettingsList = crud.contact_settings_list;
          contactSettingsList[index] = contactSettings;
          resolve(crudDoc.update({...value.data(), contact_settings_list: contactSettingsList}));
        }
      }).catch(err => reject(err));
    });
  }

  async bookAvailability(uid: string, crudUid: string, crudId: string): Promise<any> {

    const hostDoc = this.connectionCollection.doc(crudUid).collection('host').doc(uid);
    const hostDocGet = await hostDoc.get();

    let connected = false;
    let availability = true;
    let bookInfo;
    if (hostDocGet.exists) {
      connected = true;
      const {bookList} = hostDocGet.data();
      for (const book of bookList) {
        if (crudId === book.crudId) {
          availability = false;
          bookInfo = book;
        }
      }
    }

    return {connected, availability, bookInfo};
  }

  saveFavourite(uid: string, crud) {
    return new Promise(resolve => {

      let favourites: any = [];

      this.favouriteRef.child(uid).once('value').then((snapshot) => {
        if (snapshot.val()) {
          favourites = snapshot.val().data;
          favourites.push(crud);
        } else {
          favourites.push(crud);
        }
        resolve(this.favouriteRef.child(uid).update({data: favourites}));
      });
    });
  }

  async blockUser(actionUid: string, blockedUid: string, crudId: string, reason?: string): Promise<any> {

    let blockInfo;

    if (reason) {
      blockInfo = {crudId, reason, time: firebase.default.firestore.Timestamp.now()};
    } else {
      blockInfo = {crudId, time: firebase.default.firestore.Timestamp.now()};
    }

    const blockDoc = this.actionCollection.doc(actionUid).collection('block').doc(blockedUid);
    const blockDocGet = await blockDoc.get();

    if (blockDoc.exists) {
      const {blockList} = blockDocGet.data();
      blockList.push(blockInfo);
      blockDoc.update({blockList});
    } else {
      const blockList = [blockInfo];
      blockDoc.set({blockList});
    }

    return;
  }

  async flagUser(actionUid: string, blockedUid: string, crudId: string, reason: string): Promise<any> {

    const flagInfo = {crudId, reason, time: firebase.default.firestore.Timestamp.now()};

    const flagDoc = this.actionCollection.doc(actionUid).collection('flag').doc(blockedUid);
    const flagDocGet = await flagDoc.get();

    if (flagDoc.exists) {
      const {flagList} = flagDocGet.data();
      flagList.push(flagInfo);
      flagDoc.update({flagList});
    } else {
      const flagList = [flagInfo];
      flagDoc.set({flagList});
    }
  }

  async bookCrud(bookUid: string, crud, contactInfo, contactMessage): Promise<any> {

    const bookInfo = {
      crudId: crud.id,
      contactInfo,
      contactMessage,
      state: 'pending',
      time: firebase.default.firestore.Timestamp.now()
    };

    const rentDoc = this.connectionCollection.doc(bookUid).collection('rent').doc(crud.uid);
    const rentDocGet = await rentDoc.get();
    if (rentDocGet.exists) {
      const bookList = rentDocGet.data().bookList;
      bookList.push(bookInfo);
      rentDoc.update({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    } else {
      const bookList = [bookInfo];
      rentDoc.set({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    }

    const hostDoc = this.connectionCollection.doc(crud.uid).collection('host').doc(bookUid);
    const hostDocGet = await hostDoc.get();
    if (hostDocGet.exists) {
      const bookList = hostDocGet.data().bookList;
      bookList.push(bookInfo);
      hostDoc.update({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    } else {
      const bookList = [bookInfo];
      hostDoc.set({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    }

    return;
  }

  async getCrud(crudId: string, uid: string): Promise<any> {

    const userValue = await this.usersRef.child(uid).once('value');
    const user = {uid, ...userValue.val()};

    const crudDoc = await this.crudCollection.doc(crudId).get();

    return {id: crudId, ...crudDoc.data(), user};
  }

  addCrud(data) {
    return this.crudCollection.add({...data, createdAt: firebase.default.firestore.Timestamp.now()});
  }

  setCrud(crudId: string, data) {
    return this.crudCollection.doc(crudId).set(data);
  }

  updateCrud(crudId: string, data) {
    return this.crudCollection.doc(crudId).update({...data, updatedAt: firebase.default.firestore.Timestamp.now()});
  }

  deleteCrud(crudId: string) {
    return this.crudCollection.doc(crudId).delete();
  }

  activeCrud(crudId: string) {
    return this.crudCollection.doc(crudId).update({archived: false});
  }

  archiveCrud(crudId: string) {
    return this.crudCollection.doc(crudId).update({archived: true});
  }

  approveCrud(crudId: string) {
    return this.crudCollection.doc(crudId).update({live: 'approve'});
  }

  denyCrud(crudId: string) {
    return this.crudCollection.doc(crudId).update({live: 'deny'});
  }


  async connectionUsers(uid: string): Promise<any> {

    const pendingConnectionUsers = [];
    const approvedConnectionUsers = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    const rentCollection = this.connectionCollection.doc(uid).collection('rent');
    const rentCollectionGet = await rentCollection.get();

    if (rentCollectionGet.docs) {
      for (const rentDoc of rentCollectionGet.docs) {
        const {bookList} = rentDoc.data();
        const pendingBooks = bookList.filter((book) => book.state === 'pending');
        if (pendingBooks.length > 0) {
          const lastMessage = await this.getLastMessage(uid, rentDoc.id);
          pendingConnectionUsers.push({
            uid: rentDoc.id, ...usersVal[rentDoc.id],
            lastMessage,
            updatedAt: rentDoc.data().updatedAt
          });
        }
        const approvedBooks = bookList.filter((book) => book.state === 'approved');
        if (approvedBooks.length > 0) {
          const lastMessage = await this.getLastMessage(uid, rentDoc.id);
          approvedConnectionUsers.push({
            uid: rentDoc.id, ...usersVal[rentDoc.id],
            lastMessage,
            updatedAt: rentDoc.data().updatedAt
          });
        }
      }
    }

    const hostCollection = this.connectionCollection.doc(uid).collection('host');
    const hostCollectionGet = await hostCollection.get();

    if (hostCollectionGet.docs) {
      for (const hostDoc of hostCollectionGet.docs) {
        const {bookList} = hostDoc.data();
        const pendingBooks = bookList.filter((book) => book.state === 'pending');
        if (pendingBooks.length > 0) {
          const filters = pendingConnectionUsers.filter((user) => user.uid === hostDoc.id);
          if (filters.length === 0) {
            const lastMessage = await this.getLastMessage(uid, hostDoc.id);
            pendingConnectionUsers.push({
              uid: hostDoc.id, ...usersVal[hostDoc.id],
              lastMessage,
              updatedAt: hostDoc.data().updatedAt
            });
          }
        }
        const approvedBooks = bookList.filter((book) => book.state === 'approved');
        if (approvedBooks.length > 0) {
          const filters = approvedConnectionUsers.filter((user) => user.uid === hostDoc.id);
          if (filters.length === 0) {
            const lastMessage = await this.getLastMessage(uid, hostDoc.id);
            approvedConnectionUsers.push({
              uid: hostDoc.id, ...usersVal[hostDoc.id],
              lastMessage,
              updatedAt: hostDoc.data().updatedAt
            });
          }
        }
      }
    }

    pendingConnectionUsers.sort((a, b) => b.updatedAt - a.updatedAt);

    approvedConnectionUsers.sort((a, b) => b.updatedAt - a.updatedAt);

    return {pending: pendingConnectionUsers, approved: approvedConnectionUsers};
  }

  async getLastMessage(uid: string, selectedUid: string): Promise<any> {

    let lastMessage = '';
    let chatRef = `${DATABASE.CHAT}/${uid}|${selectedUid}`;

    const chatRefValue1 = await this.angularFireDatabase.database.ref(chatRef).once('value');

    if (chatRefValue1.val()) {

      const chatRefVal1 = chatRefValue1.val();

      if (chatRefVal1.hasOwnProperty('last_message')) {
        if (chatRefVal1.last_message.text) {
          lastMessage = chatRefVal1.last_message.text;
        }
        if (chatRefVal1.last_message.image) {
          lastMessage = 'Attachment image';
        }
        if (chatRefVal1.last_message.map) {
          lastMessage = 'Attachment location';
        }
      }

    } else {

      chatRef = `${DATABASE.CHAT}/${selectedUid}|${uid}`;

      const chatRefValue2 = await this.angularFireDatabase.database.ref(chatRef).orderByChild('createdAt').once('value');

      if (chatRefValue2.val()) {

        const chatRefVal2 = chatRefValue2.val();

        if (chatRefVal2.hasOwnProperty('last_message')) {
          if (chatRefVal2.last_message.text) {
            lastMessage = chatRefVal2.last_message.text;
          }
          if (chatRefVal2.last_message.image) {
            lastMessage = 'Attachment image';
          }
          if (chatRefVal2.last_message.map) {
            lastMessage = 'Attachment location';
          }
        }
      }
    }

    return lastMessage;
  }

  async connectionInfos(uid: string, selectedUid: string, state: string): Promise<any> {

    const rentBookList = [];
    const hostBookList = [];
    let contactInfo;

    const crudCollectionGet = await this.crudCollection.get();

    const rentDoc = this.connectionCollection.doc(uid).collection('rent').doc(selectedUid);
    const rentDocGet = await rentDoc.get();
    if (rentDocGet.data()) {
      const {bookList} = rentDocGet.data();
      for (const book of bookList) {
        for (const doc of crudCollectionGet.docs) {
          if (book.state === state && book.crudId === doc.id) {
            book.crud = doc.data();
            rentBookList.push(book);
          }
        }
      }
    }

    const hostDoc = this.connectionCollection.doc(uid).collection('host').doc(selectedUid);
    const hostDocGet = await hostDoc.get();
    if (hostDocGet.data()) {
      const {bookList} = hostDocGet.data();
      for (const book of bookList) {
        for (const doc of crudCollectionGet.docs) {
          if (book.state === state && book.crudId === doc.id) {
            book.crud = doc.data();
            hostBookList.push(book);
          }
        }
      }
      contactInfo = hostDocGet.data().contactInfo;
    }


    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    let chatRef = `${DATABASE.CHAT}/${uid}|${selectedUid}`;
    const messages = [];

    const chatRefValue1 = await this.angularFireDatabase.database.ref(chatRef).orderByChild('createdAt').once('value');

    if (chatRefValue1.val()) {

      const chatRefVal1 = chatRefValue1.val();

      for (const key in chatRefVal1) {
        if (chatRefVal1.hasOwnProperty(key) && key !== 'last_message' && key !== 'unread') {
          if (chatRefVal1[key].text) {
            messages.push({
              messageId: key,
              text: chatRefVal1[key].text,
              user: {uid: chatRefVal1[key].user, ...usersVal[chatRefVal1[key].user]},
              createdAt: chatRefVal1[key].createdAt,
              status: chatRefVal1[key].status
            });
          }
          if (chatRefVal1[key].image) {
            messages.push({
              messageId: key,
              image: chatRefVal1[key].image,
              user: {uid: chatRefVal1[key].user, ...usersVal[chatRefVal1[key].user]},
              createdAt: chatRefVal1[key].createdAt,
              status: chatRefVal1[key].status
            });
          }
          if (chatRefVal1[key].map) {
            messages.push({
              messageId: key,
              map: chatRefVal1[key].map,
              user: {uid: chatRefVal1[key].user, ...usersVal[chatRefVal1[key].user]},
              createdAt: chatRefVal1[key].createdAt,
              status: chatRefVal1[key].status
            });
          }
        }
      }
    } else {

      chatRef = `${DATABASE.CHAT}/${selectedUid}|${uid}`;

      const chatRefValue2 = await this.angularFireDatabase.database.ref(chatRef).orderByChild('createdAt').once('value');

      if (chatRefValue2.val()) {

        const chatRefVal2 = chatRefValue2.val();

        for (const key in chatRefVal2) {
          if (chatRefVal2.hasOwnProperty(key) && key !== 'last_message' && key !== 'unread') {
            if (chatRefVal2[key].text) {
              messages.push({
                messageId: key,
                text: chatRefVal2[key].text,
                user: {uid: chatRefVal2[key].user, ...usersVal[chatRefVal2[key].user]},
                createdAt: chatRefVal2[key].createdAt,
                status: chatRefVal2[key].status
              });
            }
            if (chatRefVal2[key].image) {
              messages.push({
                messageId: key,
                image: chatRefVal2[key].image,
                user: {uid: chatRefVal2[key].user, ...usersVal[chatRefVal2[key].user]},
                createdAt: chatRefVal2[key].createdAt,
                status: chatRefVal2[key].status
              });
            }
            if (chatRefVal2[key].map) {
              messages.push({
                messageId: key,
                map: chatRefVal2[key].map,
                user: {uid: chatRefVal2[key].user, ...usersVal[chatRefVal2[key].user]},
                createdAt: chatRefVal2[key].createdAt,
                status: chatRefVal2[key].status
              });
            }
          }
        }
      }
    }

    return {rentBookList, hostBookList, contactInfo, messages, chatRef};
  }

  async readCheckMark(chatRef, uid) {

    const chatRefValue = await this.angularFireDatabase.database.ref(chatRef).orderByChild('createdAt').once('value');


    const chatRefVal = chatRefValue.val();

    for (const key in chatRefVal) {
      if (chatRefVal.hasOwnProperty(key) && key !== 'last_message' && key !== 'unread') {
        if (chatRefVal[key].user === uid) {
          chatRefVal[key].status = 'read';
        }
      }
    }

    chatRefVal.last_message.status = 'read';

    return this.angularFireDatabase.database.ref(chatRef).update(chatRefVal);
  }

  async lastMessageRead(chatRef, lastKey, uid) {

    const chatRefValue = await this.angularFireDatabase.database.ref(chatRef).orderByChild('createdAt').once('value');


    const chatRefVal = chatRefValue.val();

    for (const key in chatRefVal) {
      if (chatRefVal.hasOwnProperty(key) && key !== 'last_message' && key !== 'unread') {
        if (key === lastKey) {
          if (chatRefVal[key].user === uid) {
            chatRefVal[key].status = 'read';
          }
        }
      }
    }

    chatRefVal.last_message.status = 'read';

    return this.angularFireDatabase.database.ref(chatRef).update(chatRefVal);
  }

  async deleteMessage(chatRef, messageId) {
    return await this.angularFireDatabase.database.ref(chatRef).child(messageId).remove();
  }


  async approveConnection(uid: string, selectedUid: string): Promise<any> {

    const rentDoc = this.connectionCollection.doc(selectedUid).collection('rent').doc(uid);
    const rentDocGet = await rentDoc.get();
    const rentBookList = rentDocGet.data().bookList;

    for (const book of rentBookList) {
      if (book.state === 'pending') {
        book.state = 'approved';
      }
    }

    rentDoc.update({bookList: rentBookList});

    const hostDoc = this.connectionCollection.doc(uid).collection('host').doc(selectedUid);
    const hostDocGet = await hostDoc.get();
    const hostBookList = hostDocGet.data().bookList;

    for (const book of hostBookList) {
      if (book.state === 'pending') {
        book.state = 'approved';
      }
    }

    hostDoc.update({bookList: hostBookList});

    return;
  }

  async denyConnection(uid: string, selectedUid: string, state: string): Promise<any> {

    const rentDoc = this.connectionCollection.doc(selectedUid).collection('rent').doc(uid);
    const rentDocGet = await rentDoc.get();
    const rentBookList = rentDocGet.data().bookList;

    for (const book of rentBookList) {
      if (book.state === state) {
        book.state = 'denied';
      }
    }

    rentDoc.update({bookList: rentBookList});

    const hostDoc = this.connectionCollection.doc(uid).collection('host').doc(selectedUid);
    const hostDocGet = await hostDoc.get();
    const hostBookList = hostDocGet.data().bookList;

    for (const book of hostBookList) {
      if (book.state === state) {
        book.state = 'denied';
      }
    }

    hostDoc.update({bookList: hostBookList});

    return;
  }

  async deleteConnection(uid: string, selectedUid: string): Promise<any> {

    const rentDoc = this.connectionCollection.doc(selectedUid).collection('rent').doc(uid);
    rentDoc.delete();


    const hostDoc = this.connectionCollection.doc(uid).collection('host').doc(selectedUid);
    hostDoc.delete();

    return;
  }

  sendMessage(refUrl: string, sender, receiver, message) {

    const chatRef = this.angularFireDatabase.database.ref(refUrl);
    const unread: any = {};

    return new Promise((resolve, reject) => {
      unread[`${receiver.uid}`] = 1;
      chatRef.update({unread, last_message: message}).then();
      chatRef.push(message).then((value) => {
        resolve(value);
      }).catch(err => reject(err));
    });
  }


  async archivedUsers(uid: string): Promise<any> {

    const archivedUsers = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    const hostCollection = this.connectionCollection.doc(uid).collection('host');
    const hostCollectionGet = await hostCollection.get();

    if (hostCollectionGet.docs) {
      for (const hostDoc of hostCollectionGet.docs) {
        const {bookList} = hostDoc.data();
        const pendingBooks = bookList.filter((book) => book.state === 'denied');
        if (pendingBooks.length > 0) {
          archivedUsers.push({uid: hostDoc.id, ...usersVal[hostDoc.id], updatedAt: hostDoc.data().updatedAt});
        }
      }
    }

    archivedUsers.sort((a, b) => b.updatedAt - a.updatedAt);

    return {denied: archivedUsers};
  }

  async activateUser(uid: string, archivedUid: string): Promise<any> {

    const rentDoc = this.connectionCollection.doc(archivedUid).collection('rent').doc(uid);
    const rentDocGet = await rentDoc.get();
    const rentBookList = rentDocGet.data().bookList;

    for (const book of rentBookList) {
      book.state = 'approved';
    }

    rentDoc.update({bookList: rentBookList});

    const hostDoc = this.connectionCollection.doc(uid).collection('host').doc(archivedUid);
    const hostDocGet = await hostDoc.get();
    const hostBookList = hostDocGet.data().bookList;

    for (const book of hostBookList) {
      book.state = 'approved';
    }

    hostDoc.update({bookList: hostBookList});

    return;
  }

  async updateConnectionContactSetting(uid: string, selectedUid: string, contactInfo): Promise<any> {

    const rentDoc = this.connectionCollection.doc(selectedUid).collection('rent').doc(uid);
    rentDoc.update({contactInfo});


    const hostDoc = this.connectionCollection.doc(uid).collection('host').doc(selectedUid);
    hostDoc.update({contactInfo});

    return;
  }


  async incomingShares(): Promise<any> {

    const pendingCruds: any[] = [];
    const flaggedCruds: any = [];
    const approvedCruds: any[] = [];
    const deniedCruds: any[] = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    const crudSnapshot = await this.crudCollection.get();

    for (const doc of crudSnapshot.docs) {
      const crudUser = {uid: doc.data().uid, ...usersVal[doc.data().uid]};

      if (!doc.data().live) {
        pendingCruds.push({id: doc.id, ...doc.data(), user: crudUser});
      } else {
        if (doc.data().live === 'approve') {
          approvedCruds.push({id: doc.id, ...doc.data(), user: crudUser});
        } else if (doc.data().live === 'deny') {
          deniedCruds.push({id: doc.id, ...doc.data(), user: crudUser});
        }
      }

      if ((doc.data().flag || doc.data().report) && doc.data()?.live === 'approve') {
        const flagList = [];
        if (doc.data().flag) {
          const flags = doc.data().flag;
          for (const flag of flags) {
            const flagUser = {uid: flag.uid, ...usersVal[flag.uid]};
            flagList.push({flagUser, reason: flag.reason});
          }
        }
        if (doc.data().report) {
          const reports = doc.data().report;
          for (const report of reports) {
            const reportUser = {uid: report.uid, ...usersVal[report.uid]};
            flagList.push({reportUser, reason: report.reason});
          }
        }
        flaggedCruds.push({id: doc.id, ...doc.data(), user: crudUser, flagList});
      }
    }


    const allRequests = [];
    const flaggedRequest = [];
    const approvedRequests = [];
    const deniedRequests = [];

    const requestSnapshot = await this.requestCollection.get();

    for (const requestDoc of requestSnapshot.docs) {

      const user = {uid: requestDoc.data().uid, ...usersVal[requestDoc.data().uid]};
      allRequests.push({id: requestDoc.id, ...requestDoc.data(), user});

      if ((requestDoc.data().report || requestDoc.data().block) && requestDoc.data()?.mark !== 'denied') {
        const flagList = [];
        if (requestDoc.data().report) {
          const reports = requestDoc.data().report;
          for (const report of reports) {
            flagList.push({reportUser: usersVal[report.uid], reason: report.reason});
          }
        }
        if (requestDoc.data().block) {
          const blocks = requestDoc.data().block;
          for (const block of blocks) {
            flagList.push({blockUser: usersVal[block.uid], reason: block.reason});
          }
        }
        flaggedRequest.push({id: requestDoc.id, ...requestDoc.data(), user, flagList});
      }

      if (requestDoc.data()?.mark === 'approved') {
        approvedRequests.push({id: requestDoc.id, ...requestDoc.data(), user});
      } else if (requestDoc.data()?.mark === 'denied') {
        deniedRequests.push({id: requestDoc.id, ...requestDoc.data(), user});
      }
    }

    return {
      crud: {pending: pendingCruds, flagged: flaggedCruds, approved: approvedCruds, denied: deniedCruds},
      request: {all: allRequests, flagged: flaggedRequest, approved: approvedRequests, denied: deniedRequests}
    };
  }

  async blockCrud(crudId: string): Promise<any> {
    const crudDoc = await this.crudCollection.doc(crudId).get();
    const crudData = crudDoc.data();
    delete crudData.flag;
    delete crudData.report;
    crudData.live = 'deny';
    await this.crudCollection.doc(crudId).set(crudData);
    return;
  }

  async keepCrud(crudId: string): Promise<any> {
    const crudDoc = await this.crudCollection.doc(crudId).get();
    const crudData = crudDoc.data();
    delete crudData.flag;
    delete crudData.report;
    await this.crudCollection.doc(crudId).set(crudData);
    return;
  }

  async adminBlockRequest(requestId: string): Promise<any> {
    const requestDoc = await this.requestCollection.doc(requestId).get();
    const requestData = requestDoc.data();
    delete requestData.report;
    delete requestData.block;
    requestData.mark = 'denied';
    return await this.requestCollection.doc(requestId).set(requestData);
  }

  async keepRequest(requestId: string): Promise<any> {
    const requestDoc = await this.requestCollection.child(requestId).once('value');
    const requestData = requestDoc.data();
    delete requestData.report;
    delete requestData.block;
    requestData.mark = 'approved';
    return await this.requestCollection.doc(requestId).set(requestData);
  }

  approveRequest(requestId: string) {
    return this.requestCollection.doc(requestId).update({mark: 'approved'});
  }

  denyRequest(requestId: string) {
    return this.requestCollection.doc(requestId).update({mark: 'denied'});
  }

  async changeBanState(uid: string, data): Promise<any> {

    await this.usersRef.child(uid).update(data);

    const usersValue = await this.adminRef.child('bannedUsers').once('value');
    let users = usersValue.val();
    if (data.banned) {
      if (!users) {
        users = {};
      }
      users[uid] = data.banned;
    } else {
      delete users[uid];
    }

    return await this.adminRef.child('bannedUsers').set(users);
  }

  async getUsers(): Promise<any> {

    const users = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    for (const key in usersVal) {
      if (usersVal.hasOwnProperty(key)) {
        users.push({uid: key, ...usersVal[key]});
      }
    }

    return users;
  }

  async getPendingUsers(): Promise<any> {

    const pendingUsers = [];
    const verifiedUsers = [];
    const deniedUsers = [];
    const deletedUsers = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    for (const key in usersVal) {
      if (usersVal.hasOwnProperty(key)) {
        if (usersVal[key].verifyStatus && usersVal[key].verifyStatus === 'pending') {
          pendingUsers.push({...usersVal[key], uid: key});
        }
        if (usersVal[key].verifyStatus && usersVal[key].verifyStatus === 'verified') {
          verifiedUsers.push({...usersVal[key], uid: key});
        }
        if (usersVal[key].verifyStatus && usersVal[key].verifyStatus === 'denied') {
          deniedUsers.push({...usersVal[key], uid: key});
        }
        if (usersVal[key].verifyStatus && usersVal[key].verifyStatus === 'deleted') {
          deletedUsers.push({...usersVal[key], uid: key});
        }
      }
    }

    return {pending: pendingUsers, verified: verifiedUsers, denied: deniedUsers, deleted: deletedUsers};
  }

  addRequest(data) {
    return this.requestCollection.add({...data, createdAt: firebase.default.firestore.Timestamp.now()});
  }

  deleteRequest(requestId: string) {
    return this.requestCollection.doc(requestId).delete();
  }

  async connectRequest(uid: string, requestUid: string, requestId: string): Promise<any> {

    const bookInfo = {requestId, time: firebase.default.firestore.Timestamp.now()};

    const sentDoc = this.requestConnectionCollection.doc(uid).collection('sent').doc(requestUid);
    const sentDocGet = await sentDoc.get();
    if (sentDocGet.exists) {
      const bookList = sentDocGet.data().bookList;
      bookList.push(bookInfo);
      sentDoc.update({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    } else {
      const bookList = [bookInfo];
      sentDoc.set({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    }

    const receivedDoc = this.connectionCollection.doc(requestUid).collection('received').doc(uid);
    const receivedDocGet = await receivedDoc.get();
    if (receivedDocGet.exists) {
      const bookList = receivedDocGet.data().bookList;
      bookList.push(bookInfo);
      receivedDoc.update({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    } else {
      const bookList = [bookInfo];
      receivedDoc.set({bookList, updatedAt: firebase.default.firestore.Timestamp.now()});
    }

    return;
  }

  async checkConnectionState(uid: string, requestUid: string, requestId: string): Promise<string> {

    let connectionState = 'unConnected';

    const sentDoc = this.requestConnectionCollection.doc(uid).collection('sent').doc(requestUid);
    const sentDocGet = await sentDoc.get();

    if (sentDocGet.exists) {
      const {bookList} = sentDocGet.data();
      for (const book of bookList) {
        if (book.requestId === requestId) {
          connectionState = 'connected';
        }
      }
    }

    return connectionState;
  }

  async reportRequest(requestId: string, data): Promise<any> {

    const requestDoc = await this.requestCollection.child(requestId).get();

    let reports = [];

    if (requestDoc.data().report) {
      reports = requestDoc.data().report;
      reports.push(data);
    } else {
      reports.push(data);
    }

    return this.requestCollection.doc(requestId).update({report: reports});
  }

  async userBlockRequest(requestId: string, data): Promise<any> {

    const requestDoc = await this.requestCollection.child(requestId).get();

    let blocks = [];

    if (requestDoc.data().block) {
      blocks = requestDoc.data().block;
      blocks.push(data);
    } else {
      blocks.push(data);
    }

    return this.requestCollection.doc(requestId).update({block: blocks});
  }


  async guestPreviewInfos(): Promise<any> {

    const crudItems = await this.allCrud();
    const requests = await this.getRequests();

    return {crud: crudItems, request: requests};
  }

  async allCrud(): Promise<any> {

    const crudItems = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    const crudSnapshot = await this.crudCollection.get();

    for (const doc of crudSnapshot.docs) {

      const user = {uid: doc.data().uid, ...usersVal[doc.data().uid]};

      if (doc.data()?.live === 'approve' && !doc.data()?.archived) {
        crudItems.push({id: doc.id, ...doc.data(), user});
      }
    }

    return crudItems;
  }

  async getRequests(): Promise<any> {

    const requests = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    const requestSnapshot = await this.requestCollection.get();

    for (const requestDoc of requestSnapshot.docs) {

      const user = {uid: requestDoc.data().uid, ...usersVal[requestDoc.data().uid]};

      if (requestDoc.data()?.mark !== 'denied') {
        requests.push({id: requestDoc.id, ...requestDoc.data(), user});
      }
    }

    requests.sort((a, b) => b.createdAt - a.createdAt);

    return requests;
  }

  async dashboardInfos(uid: string): Promise<any> {

    const crudItems = await this.dashboardCrud(uid);
    const requests = await this.getRequests();

    return {crud: crudItems, request: requests};
  }

  async dashboardCrud(uid: string): Promise<any> {

    const crudItems = [];

    const usersValue = await this.usersRef.once('value');
    const usersVal = usersValue.val();

    const blockedUids = usersVal[uid].blocked;

    const crudSnapshot = await this.crudCollection.get();

    for (const doc of crudSnapshot.docs) {

      const user = {...usersVal[doc.data().uid], uid: doc.data().uid};

      if (doc.data()?.live === 'approve' && !doc.data()?.archived) {
        if (!blockedUids) {
          crudItems.push({id: doc.id, ...doc.data(), user});
        } else {
          if (!blockedUids.includes(doc.data().uid)) {
            crudItems.push({id: doc.id, ...doc.data(), user});
          }
        }
      }
    }

    return crudItems;
  }


}
