import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class VjsService {

  constructor(
    private api: ApiService,
    public gs: GlobalService
  ) {
    if (this.gs.isBrowser) {
      //
    }
  }

  async loadSubtitle(subtitleUrls, callback) {
    const urls: any = [];
    if (subtitleUrls.length > 0) {
      for (const s of subtitleUrls) {
        this.gs.log('[DOWNLOAD_SUBTITLE]', s.id);
        const handler = this.api.getData(`/attachment/${s.id}`, {
          responseType: 'blob',
          observe: 'events',
          reportProgress: true
        }).subscribe({
          next: event => {
            if ((event as any).body) {
              const e = (event as any);
              urls.push(URL.createObjectURL(new Blob([e.body])));
              handler.unsubscribe();
              if (urls.length === subtitleUrls.length) {
                callback(urls);
              }
            }
          }
        });
      }
    } else {
      callback(urls);
    }
  }

  async loadFonts(fontUrls, callback) {
    const urls: any = [];
    if (fontUrls.length > 0) {
      for (const f of fontUrls) {
        this.gs.log('[DOWNLOAD_SUBTITLE]', f.id);
        const handler = this.api.getData(`/attachment/${f.id}`, {
          responseType: 'blob',
          observe: 'events',
          reportProgress: true
        }).subscribe({
          next: event => {
            if ((event as any).body) {
              const e = (event as any);
              urls.push(URL.createObjectURL(new Blob([e.body])));
              handler.unsubscribe();
              if (urls.length === fontUrls.length) {
                callback(urls);
              }
            }
          }
        });
      }
    } else {
      callback(urls);
    }
  }

}
