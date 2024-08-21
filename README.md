# kori coinflip

will autobet your channel points (all of them) on a random coin side when kori goes on break :)

## installation

this extension is pretty specific to google chrome/chromium, but im going out on a limb and assume chrome 
extensions are (mostly) universally compatible across chromium-based browsers. 

surely...

### pre-built

~~- download a packed `kori_coinflip.crx` from releases, then navigate to `chrome://extensions`~~
~~- turn on developer mode and drag+drop it from your local folder into the extensions page to install.~~ 

just build from source for now bc it don't pack correctly >:(

### build from source

> built using bun so the lockfile is a `bun.lockb`, but you should be able to replace the
> final command with your package manager of choice (`pnpm`/`npm`/??).

clone the repo, `cd` into it and build:

```bash
git clone https://github.com/plsuwu/kori-coinflip
cd kori-coinflip
bun run build
```

then in your browser:
- navigate to `chrome://extensions` (or your browser's equivalent)
- turn on developer mode
- click `load unpacked` and select the `dist` directory 
