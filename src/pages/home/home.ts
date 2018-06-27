import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, AlertController, LoadingController, Loading } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { QRCodeService } from '../../services/qrcode.service';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {

  isCodeRetrieved: boolean;
  isNetworkUnavailable: boolean;
  connectSubscription: Subscription;
  disconnectSubscription: Subscription;
  code: string;
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  deviceManufacturer: string;
  codeRefresher: number;
  loader: Loading;

  constructor(public plt: Platform,
    public navCtrl: NavController,
    private device: Device,
    private qrService: QRCodeService,
    private network: Network,
    private alertCtrl: AlertController,
    private changeDetector: ChangeDetectorRef,
    private loadCtrl: LoadingController) {
    plt.ready().then(() => {
      console.log('The platform is ready for Home page');
      console.log('The device id in Home Page is ', this.device.uuid);
      console.log('The device name is ', (window as any).device.name);
      console.log('The device\'s model is ', this.device.model);
      console.log('The device\'s manufacturer is ', this.device.manufacturer);

      this.deviceId = this.device.uuid;
      this.deviceName = (window as any).device.name;
      this.deviceModel = this.device.model;
      this.deviceManufacturer = this.device.manufacturer;

      this.setupNetworkListener();
      if (this.network.type !== 'none') {
        this.getEncryptedCodeFromService();
        this.startCodeRefresher();
      } else {
        this.showAlertMessage('You do not seem to be connect to the internet, please connect.');
        this.isNetworkUnavailable = true;
      }
    });
  }

  getEncryptedCodeFromService() {
    this.loader = this.presentLoadingMessage();
    this.loader.present();
    this.qrService.getEncryptedData(this.deviceId, this.deviceName, this.deviceModel, this.deviceManufacturer).then((encryptedData) => {
      console.log('Data retrieved: ' + encryptedData);
      this.code = encryptedData;
      this.isCodeRetrieved = true;
      this.changeDetector.detectChanges();
      this.loader.dismiss();
    }, error => console.log(error));
  }

  setupNetworkListener() {
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      // check if data is already loaded
      // if data is not present, load data
      this.isNetworkUnavailable = true;
      this.showAlertMessage('Network unavailable, please connect to the internet');
      console.log(this.codeRefresher);
      clearInterval(this.codeRefresher);
      if (this.loader) this.loader.dismissAll();
    });


    // watch network for a connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      // check if data has already been loaded
      // if not, load the data now
      this.isNetworkUnavailable = false;
      this.getEncryptedCodeFromService();
      this.startCodeRefresher();
      // this.showAlertMessage('Network available!');
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          // this.showAlertMessage('');
        }
      }, 3000);
    });
  }

  showAlertMessage(message: string) {
    let alert = this.alertCtrl.create({
      title: 'Alert!',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  presentLoadingMessage(): Loading {
    return this.loadCtrl.create({
      content: 'Please wait...'
    });
  }

  startCodeRefresher() {
    this.codeRefresher = setInterval(() => {
      this.getEncryptedCodeFromService();
    }, 600000);
  }

  ngOnDestroy() {
    // stop disconnect watch
    this.disconnectSubscription.unsubscribe();
    // stop connect watch
    this.connectSubscription.unsubscribe();
  }
}
