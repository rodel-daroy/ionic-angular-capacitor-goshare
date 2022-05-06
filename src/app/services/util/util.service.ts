import {Injectable} from '@angular/core';

import {LoadingController} from '@ionic/angular';

import {ActionSheetOptionStyle, Plugins} from '@capacitor/core';

const {Modals, Toast} = Plugins;

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  loading;

  constructor(private loadingController: LoadingController) {
  }

  async showAlert(title: string, message: string) {
    await Modals.alert({
      title,
      message
    });
  }

  async showConfirm(title: string, message: string) {
    const confirmRet = await Modals.confirm({
      title,
      message
    });
  }

  async showPrompt(title: string, message: string) {
    const promptRet = await Modals.prompt({
      title,
      message
    });
  }

  async showActions() {
    const promptRet = await Modals.showActions({
      title: 'Photo Options',
      message: 'Select an option to perform',
      options: [
        {
          title: 'Upload'
        },
        {
          title: 'Share'
        },
        {
          title: 'Remove',
          style: ActionSheetOptionStyle.Destructive
        }
      ]
    });
  }

  async showToast(text: string) {
    await Toast.show({text});
  }

  async presentLoading(duration?: number, message?: string) {

    this.loading = await this.loadingController.create({
      duration: duration ? duration : null,
      message: message ? message : null
    });

    await this.loading.present();
  }

  dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

}
