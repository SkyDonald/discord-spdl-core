# discord-spdl-core

Spotify track downloader module. Written in pure javascript.

> Requires node >=14

# Credentials

The module need a Spotify `clientId` and `clientSecret` to work, the module provide you one but if too much people use the module with this credentials, you will be rate limited and the module won't work.
To avoid this, you should set your own credentials.
To do that, go to [The Spotify developers dashboard](https://developer.spotify.com/dashboard/applications) and create an application.
Copy your credentials and paste it with:
```js
spdl.setCredentials("Your app's clientId", "Your app's clientSecret");
// or
spdl.setClientId("Your app's clientId");
spdl.setClientSecret("Your app's clientSecret");
```

# Support
You can contact us for support on our [chat server](https://discord.gg/AUfTUJA)

# Usage

```js
const fs = require('fs');
const spdl = require('discord-spdl-core').default;
// Typescript: import spdl from 'discord-spdl-core';

spdl.getInfo('https://open.spotify.com/track/3fjmSxt0PskST13CSdBUFx?si=e420cd3a80834011').then(infos => {
  spdl(infos.url, {
    filter: 'audioonly',
    fmt: 'mp3,
    encoderArgs: ['-af', 'bass=g=10']
  }).then(stream => {
    stream.on('end', () => console.log('Done!'));
    stream.pipe(fs.createWriteStream(`${infos.title}-bass_boosted.mp3`));
  });
});
```

# Opus [optional]
> Please install opus engine if you want to encode the stream to opus format.

## **Supported Opus Engines**
- **[@discordjs/opus](https://npmjs.com/package/@discordjs/opus)**
- **[node-opus](https://npmjs.com/package/node-opus)**
- **[opusscript](https://npmjs.com/package/opusscript)**

# API
## spdl(url, options?)
Similar to spdl-core but this method allows you to pass custom FFmpeg args in options.

## spdl.arbitraryStream(source, options?)
This method allows you to play the stream from other sources rather than just `youtube`. Stream source must be a string or stream object (internal.Readable | internal.Duplex).
Through URL: **[https://listen.moe/kpop/opus](https://listen.moe/kpop/opus)**

Using fs:
```js
let stream = fs.createReadStream('./music.mp4');
spdl.arbitraryStream(stream, {
    fmt: 'mp3',
    encoderArgs: ['-af', 'bass=g=10']
}).then(stream => stream.pipe(fs.createWriteStream('./music.mp3')));
```

### Other methods are the methods for **[spdl-core](https://npmjs.com/package/spdl-core)**.

# Options
This package provides 4 extra options excluding spdl-core options.

- `seek`: This option takes the time in seconds. 
If this option is provided, it will return the stream from that frame.
Seek option is provided here because discord.js seek doesn't work for `ogg/opus` & `webm/opus` stream.
This option is ignored when the supplied parameter type isn't a number.

- `encoderArgs`: This option takes the Array of FFmpeg arguments.
Invalid args will throw error and crash the process.
This option is ignored when the supplied parameter type isn't array. Invalid FFmpeg args might crash the process.

- `opusEncoded`: This option takes a Boolean value. If true, it returns `opus encoded` stream.
  If `fmt` option isn't provided, it returns `converted` stream type of discord.js. Other values returns `unknown` stream if `opusEncoded` is false.

- `fmt`: Forcefully changes the stream format. Don't use this option for default value. Even though this option changes the format, 
  it returns `opus` stream if `opusEncoded` is set to `true`. 

- Other options are the options for **[spdl-core](https://npmjs.com/package/spdl-core)**.

# Install

```bash
npm install discord-spdl-core@latest
```

Or for Yarn users:
```bash
yarn add discord-spdl-core@latest
```

Make sure you're installing the latest version of discord-spdl-core to keep up with the latest fixes.

# Discord Bot

You'll need to install `discord.js` and `@discordjs/opus`.

```js
const { MessageEmbed, Client } = require('discord.js');
const spdl = require('discord-spdl-core');
function formatDuration(duration) {
  let seconds = duration / 1000;
  return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
}

const client = new Client();
client.login('Your Discord Bot Token');
client.on('ready', () => console.log('Ready'));

client.on('message', async (msg) => {
  if (!msg.content.startsWith('!play')) return;
  const url = msg.content.split('!play ')[1];
  if (!spdl.validateURL(url)) return msg.channel.send('Invalid URL');
  const channel = msg.member.voice.channel;
  if (!channel) return msg.channel.send('Not in a voc channel');
  try {
    const connection = await channel.join();
    connection
      .play(await spdl(url, {
        opusEncoded: true,
        filter: 'audioonly',
        encoderArgs: ['-af', 'apulsator=hz=0.09']
      }))
      .on('error', e => console.error(e));
    const infos = await spdl.getInfo(url);
    const embed = new MessageEmbed()
      .setTitle(`Now playing: ${infos.title}`)
      .setURL(infos.url)
      .setColor('#1DB954')
      .addField(`Artist${infos.artists.length > 1 ? 's': ''}`, infos.artists.join(', '), true)
      .addField('Duration', formatDuration(infos.duration), true)
      .addField('Preview', `[Click here](${infos.preview_url})`, true)
      .setThumbnail(infos.thumbnail);
    msg.channel.send(embed);
  } catch (err) {
    console.error(err);
    msg.channel.send(`An error occurred: ${err.message}`);
  }
});
```

# Related Projects

- [spdl-core](https://www.npmjs.com/package/discord-spdl-core) - The original package of this.

# Note

There is nothing illegal here, the module just searches for the song on Youtube and downloads it.
