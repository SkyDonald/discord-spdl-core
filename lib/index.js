const pkg = require('../package.json');
const Youtube = require('youtube-sr').default;
const ytdl = require('discord-ytdl-core');
const fetch = require('node-fetch');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: '544109f2efdc4f6f9e429ca74bdacc9f',
  clientSecret: '8c05fc01247a4683ad09c3583e796ab4'
});

const spdl = async (url, options) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!SPDLCore.validateURL(url)) return reject('Invalid URL');
      const data = await fetch('https://accounts.spotify.com/api/token?grant_type=client_credentials', {
        method: 'POST',
        headers: {
          authorization: `Basic ${Buffer.from(`${spotifyApi.getCredentials().clientId}:${spotifyApi.getCredentials().clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const json = await data.json();
      spotifyApi.setAccessToken(json.access_token);
      const infos = await spotifyApi.getTrack(SPDLCore.getURLTrackID(url));
      if (!infos) return reject('Track not found');
      let video = await Youtube.searchOne(`${infos.body.name} ${infos.body.artists[0].name}`);
      if (!video) video = await Youtube.searchOne(`${infos.body.name}`);
      if (!video || video.live) return reject('Track not found');
      return resolve(ytdl(video.url, options));
    } catch (err) {
      return reject(err);
    }
  });
};

class SPDLCore {
  static async getInfo(url) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!SPDLCore.validateURL(url)) return reject('Invalid URL');
        const data = await fetch('https://accounts.spotify.com/api/token?grant_type=client_credentials', {
          method: 'POST',
          headers: {
            authorization: `Basic ${Buffer.from(`${spotifyApi.getCredentials().clientId}:${spotifyApi.getCredentials().clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).catch(err => reject(err));
        const json = await data.json();
        spotifyApi.setAccessToken(json.access_token);
        const infos = await spotifyApi.getTrack(SPDLCore.getURLTrackID(url)).catch(err => reject(err));
        if (!infos) return reject('Track not found');
        let video = await Youtube.searchOne(`${infos.body.name} ${infos.body.artists[0].name}`);
        if (!video) video = await Youtube.searchOne(`${infos.body.name}`);
        if (!video || video.live) return reject('Track not found');
        return resolve({
          title: infos.body.name,
          artists: infos.body.artists.map(a => a.name),
          url: infos.body.external_urls.spotify,
          id: infos.body.id,
          uri: infos.body.uri,
          duration: video.duration,
          thumbnail: video.thumbnail.url,
          preview_url: infos.body.preview_url
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  static validateURL(url) {
    try {
      return /^https?:\/\/(?:open|play)\.spotify\.com\/track\/[\w\d]+$/i.test(SPDLCore.parse(url));
    } catch (err) {
      throw new Error(err);
    }
  }

  static setCredentials(clientId, clientSecret) {
    try {
      spotifyApi.setCredentials({
        clientSecret,
        clientId
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  static setClientId(clientId) {
    try {
      spotifyApi.setClientId(clientId);
    } catch (err) {
      throw new Error(err);
    }
  }

  static setClientSecret(clientSecret) {
    try {
      spotifyApi.setClientSecret(clientSecret);
    } catch (err) {
      throw new Error(err);
    }
  }

  static getURLTrackID(url) {
    try {
      if (!SPDLCore.validateURL(url)) throw new Error('Invalid URL');
      return SPDLCore.parse(url).split('track/')[1];
    } catch (err) {
      throw new Error(err);
    }
  }

  static parse(url) {
    try {
      return url.split('?')[0];
    } catch (err) {
      throw new Error(err);
    }
  }

  static async arbitraryStream(source, options) {
    return new Promise(async (resolve, reject) => {
      try {
        return resolve(ytdl.arbitraryStream(source, options));
      } catch (err) {
        return reject(err);
      }
    });
  }

  static async updater() {
    if (!process.env.SPDL_NO_UPDATE) {
      try {
        const fetched = await fetch('https://api.github.com/repos/SkyDonald/discord-spdl-core/releases/latest', {
          headers: {
            'User-Agent': 'discord-spdl-core'
          }
        });
        const data = await fetched.json();
    
        if (data.tag_name !== `v${pkg.version}`) {
          console.warn('\x1b[33mWARNING:\x1B[0m discord-spdl-core is out of date! Update with "npm install discord-spdl-core@latest"');
        }
      } catch (err) {
        console.warn('Error checking for updates: ', err.message);
        console.warn('You can disable this check by setting the `YTDL_NO_UPDATE` env variable to false');
      }
    }
  }

}

spdl.arbitraryStream = SPDLCore.arbitraryStream;
spdl.validateURL = SPDLCore.validateURL;
spdl.getInfo = SPDLCore.getInfo;
spdl.setCredentials = SPDLCore.setCredentials;
spdl.setClientId = SPDLCore.setClientId;
spdl.setClientSecret = SPDLCore.setClientSecret;

SPDLCore.updater();

module.exports = spdl;
module.exports.default = spdl;