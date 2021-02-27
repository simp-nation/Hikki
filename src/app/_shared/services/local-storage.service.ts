import { Injectable } from '@angular/core';

import { environment } from '../../../environments/client/environment';

import { CryptoService } from './crypto.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  public token = null;

  constructor(
    private crypt: CryptoService,
    private gs: GlobalService
  ) {
    if (this.gs.isBrowser) {
      //
    }
  }

  getItem(key, isObject = false): any {
    if (this.gs.isBrowser) {
      if (!isObject) {
        return localStorage.getItem(key);
      } else {
        try {
          const encryptedString = localStorage.getItem(key);
          const jsonString = this.crypt.decrypt(encryptedString, environment.apiKey);
          return JSON.parse(jsonString);
        } catch (error) {
          this.removeItem(key);
          return null;
        }
      }
    } else {
      return null;
    }
  }

  setItem(key, value): void {
    if (this.gs.isBrowser) {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        const jsonString = JSON.stringify(value);
        const encryptedString = this.crypt.encrypt(jsonString, environment.apiKey);
        localStorage.setItem(key, encryptedString);
      }
    }
  }

  removeItem(key): void {
    if (this.gs.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.gs.isBrowser) {
      localStorage.clear();
    }
  }

}
