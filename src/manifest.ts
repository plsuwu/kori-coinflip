import { defineManifest } from '@crxjs/vite-plugin';
// import packageJson from '../package.json';

/**
 * rollup-plugin-chrome-extension
 * https://github.com/extend-chrome/rollup-plugin-chrome-extension
 */
// interface Manifest {
// 	manifest_version: number;
// 	name: string;
// 	version: string;
// 	description?: string | undefined;
// 	icons?: chrome.runtime.ManifestIcons | undefined;
// 	action?: chrome.runtime.ManifestAction | undefined;
// 	permissions?: string[] | undefined;
// 	background?:
// 		| {
// 				service_worker: string;
// 				type?: 'module';
// 		  }
// 		| undefined;
// 	content_scripts?:
// 		| {
// 				matches?: string[] | undefined;
// 				exclude_matches?: string[] | undefined;
// 				css?: string[] | undefined;
// 				js?: string[] | undefined;
// 				run_at?: string | undefined;
// 				all_frames?: boolean | undefined;
// 				match_about_blank?: string[] | undefined;
// 				include_globs?: string[] | undefined;
// 				exclude_globs?: string[] | undefined;
// 		  }[]
// 		| undefined;
// }

const manifest = defineManifest(async () => ({
	manifest_version: 3,
	name: 'kori coinflip',
	version: '0.1.1',
	background: { service_worker: './src/lib/worker.ts' },
	permissions: ['storage', 'identity', 'tabs', 'scripting'],
	host_permissions: ['*://*/*'],
	action: {
		default_popup: 'index.html',
		default_icon: 'public/disabled/insanerac_d9.png',
	},
	web_accessible_resources: [
		{
			resources: ['public/enabled/*', 'public/disabled/*'],
			matches: ['*://*/*'],
		},
	],
	content_scripts: [
		{
			matches: ['*://*.twitch.tv/kori'],
			js: ['./src/lib/content_scripts/autopredict.tsx'],
		},
		{
			matches: ['*://*.twitch.tv/kori'],
			js: ['./src/lib/content_scripts/socket/websocket.ts'],
		},
	],
	// 	{
	// 		matches: ['https://twitch.tv/kori'],
	// 		js: ['src/lib/util/socket.tsx'],
	// 	},
	// ],
}));

export default manifest;
