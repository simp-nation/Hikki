import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {

  constructor(
    private api: ApiService
  ) {
  }

  getSeasonalAnime(year: number, season: string): any {
    return this.api.getData(`/anime/seasonal?year=${year}&season=${season}`);
  }

  getAnime(animeId: number): any {
    return this.api.getData(`/anime/${animeId}`);
  }

  getBerkasAnime(animeId = [], q = null, page = 1, row = 10): any {
    return this.api.postData(`/anime/berkas?q=${q}&page=${page}&row=${row}`, { animeId });
  }

  getFansubAnime(animeId = []): any {
    return this.api.postData(`/anime/fansub`, { animeId });
  }

}
