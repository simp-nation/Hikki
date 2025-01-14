// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  siteName: 'Hikki',
  author: 'Bifeldy',
  baseUrl: 'http://localhost:4000',
  apiUrl: '/api',
  apiKey: 'hikki_api_key',
  discordUrl: 'https://discord.gg/xGWdExk',
  discordGuildId: '342220398022098944',
  discordClientId: '789831990433153034',
  trackerAnnounce: [
    'wss://tracker.hikki.id',
    'wss://tracker.btorrent.xyz',
    'wss://tracker.openwebtorrent.com'
  ],
  iceServers: [
    {
      urls: [
        'stun:stun-turn.hikki.id:5349',
        'stun:relay.socket.dev:443'
      ]
    },
    {
      urls: ['turn:stun-turn.hikki.id:5349'],
      username: 'turn',
      credential: 'hikki.id'
    },
    {
      urls: ['turn:relay.socket.dev:443'],
      username: 'relay.socket.dev',
      credential: 'tears-whiplash-overall-diction'
    }
  ]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */

// import 'zone.js/plugins/zone-error';
// Included with Angular CLI.
