import { defineManifest } from '@crxjs/vite-plugin';
// import packageJson from '../package.json';

/**
 * rollup-plugin-chrome-extension
 * https://github.com/extend-chrome/rollup-plugin-chrome-extension
 */
interface Manifest {
	manifest_version: number;
	name: string;
	version: string;
	description?: string | undefined;
	icons?: chrome.runtime.ManifestIcons | undefined;
	action?: chrome.runtime.ManifestAction | undefined;
	permissions?: string[] | undefined;
	background?:
		| {
				service_worker: string;
				type?: 'module';
		  }
		| undefined;
	content_scripts?:
		| {
				matches?: string[] | undefined;
				exclude_matches?: string[] | undefined;
				css?: string[] | undefined;
				js?: string[] | undefined;
				run_at?: string | undefined;
				all_frames?: boolean | undefined;
				match_about_blank?: string[] | undefined;
				include_globs?: string[] | undefined;
				exclude_globs?: string[] | undefined;
		  }[]
		| undefined;
}

const manifest = defineManifest(async () => ({
	manifest_version: 3,
	name: 'kori coinflip',
	version: '0.1.0',
	background: { service_worker: 'src/lib/worker.tsx' },
	permissions: ['storage', 'identity', 'tabs', 'scripting'],
	host_permissions: [
		'http://twitch.tv/*',
		'http://twitch.tv/kori',
		'https://twitch.tv/kori',
	],

	action: {
		default_popup: 'index.html',
		default_icon: 'public/kori.png',
	},
	content_scripts: [
		{
			matches: ['https://www.twitch.tv/kori'],
			js: ['./src/lib/socket/coin-logic.tsx'],
		}
    ]
	// 	{
	// 		matches: ['https://twitch.tv/kori'],
	// 		js: ['src/lib/util/socket.tsx'],
	// 	},
	// ],
}));

export default manifest;
