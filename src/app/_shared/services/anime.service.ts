import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {

  constructor(
    private api: ApiService,
    private gs: GlobalService
  ) {
    if (this.gs.isBrowser) {
      //
    }
  }

  searchAnime(q: string, type = ''): Observable<any> {
    return this.api.getData(`/anime?q=${q}&type=${type}`);
  }

  getAnime(animeId: string): Observable<any> {
    return this.api.getData(`/anime/${animeId}`);
  }

  addNewAnime(animeData): Observable<any> {
    return this.api.postData(`/anime`, animeData);
  }

  getSeasonalAnime(year: number, season: string): Observable<any> {
    return this.api.patchData(`/anime/seasonal?year=${year}&season=${season}`);
  }

  getBerkasAnime(animeId = [], q = '', page = 1, row = 10, sort = '', order = ''): Observable<any> {
    return this.api.patchData(`/anime/berkas?q=${q}&page=${page}&row=${row}&sort=${sort}&order=${order}`, { id: animeId });
  }

  getFansubAnime(animeId = [], page = 1, row = 10): Observable<any> {
    return this.api.patchData(`/anime/fansub?page=${page}&row=${row}`, { id: animeId });
  }

}
