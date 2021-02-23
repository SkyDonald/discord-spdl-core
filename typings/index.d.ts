import { downloadOptions } from 'ytdl-core';
import { opus as Opus, FFmpeg } from 'prism-media';
import { Readable, Duplex } from 'stream';

declare module 'discord-spdl-core' {
  namespace spdl {
    interface trackInfo {
      /**
       * The track title
       */
      title: string;
      /**
       * The track artists
       */
      artists: string[];
      /**
       * The track url
       */
      url: string;
      /**
       * The track id
       */
      id: string;
      /**
       * The track uri
       */
      uri: string;
      /**
       * The track duration
       */
      duration: number;
      /**
       * The track thumbnail
       */
      thumbnail: string;
      /**
       * A link to a 30 second preview (MP3 format) of the track. Can be null
       */
      preview_url: string;
    }

    interface SPDLStreamOptions extends downloadOptions {
        seek?: number;
        encoderArgs?: string[];
        fmt?: string;
        opusEncoded?: boolean;
    }

    interface StreamOptions {
        seek?: number;
        encoderArgs?: string[];
        fmt?: string;
        opusEncoded?: boolean;
    }

    /**
     * This method allows you to play the stream from other sources rather than just `spotify`. Stream source must be a string or stream object (internal.Readable | internal.Duplex)
     */
    function arbitraryStream(source: string | Readable | Duplex, options: StreamOptions): Promise<Opus.Encoder | FFmpeg>;
    /**
     * Sets the module credentials to yours
     */
    function setCredentials(clientId: string, clientSecret: string): void;
    /**
     * Sets the module credentials to yours
     */
    function setClientId(clientId: string): void;
    /**
     * Sets the module credentials to yours
     */
    function setClientSecret(clientSecret: string): void;
    /**
     * Gives the information of a track
     */
    function getInfo(url: string): Promise<trackInfo>;
    /**
     * Returns true if url is a spotify track link
     */
    function validateURL(url: string): boolean;
  }

  /**
   * Downloads the track from the given url. Returns a readable stream
   */
  function spdl(link: string, options?: SPDLStreamOptions): Promise<Opus.Encoder | FFmpeg>;
  
  export default spdl;
}