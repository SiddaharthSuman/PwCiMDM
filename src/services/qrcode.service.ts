import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class QRCodeService {

    lookupURL = 'http://pwcimdm-server.000webhostapp.com/encryptor.php';

    constructor(private http: HttpClient) {}

    getEncryptedData(deviceId: string, deviceName: string, deviceModel: string, deviceManufacturer: string): Promise<string> {
        const body = { 
            "deviceID": deviceId,
            "deviceName": deviceName,
            "deviceModel": deviceModel,
            "deviceManufacturer": deviceManufacturer
        };
        return this.http.post(this.lookupURL, JSON.stringify(body),{responseType: "text"}).toPromise();
    }
}
