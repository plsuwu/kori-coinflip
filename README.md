# kori coinflip

automatically put all your channel points (all of them) on a random coin side when kori goes on break :)
<br/>
<p align="center">
  <img src="https://raw.githubusercontent.com/plsuwu/kori-coinflip/master/kori-screenshot.png" alt="koroinflip"/>
</p>

## installation

this extension is pretty specific to google chrome/chromium, but im going out on a limb and i will assume chrome 
extensions are probably (mostly?) universally compatible across chromium-based browsers. 

surely...

### pre-built

- download a packed `kori_coinflip-[tag].crx` from releases, 
- navigate to `chrome://extensions`,
- turn on developer mode
- drag+drop the `.crx` file into the extensions window from your local filesystem.
  - and also confirm the safety check if necessary its safe i swear you can trust me:)   

### build from source

> built using bun so the lockfile is a `bun.lockb`, but you should be able to replace the
> final command with your package manager of choice (`pnpm`/`npm`/??).

clone the repo, `cd` into it and build:

```bash
git clone https://github.com/plsuwu/kori-coinflip
cd kori-coinflip

# note that yarn can be a drop-in replacement for bun
bun install --frozen-lockfile
bun run build
```

then in your browser:
- navigate to `chrome://extensions` (or your browser's equivalent)
- turn on developer mode
- click `load unpacked` and select the `dist` directory 

> TTV requires a specific callback URL during OAuth, so the extension will not properly run the oauth flow
> if you build & pack yourself, though this SHOULD run fine when unpacked. 
