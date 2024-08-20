import { createSignal } from 'solid-js';
import { validate, revoke, color } from './content_scripts/requests';
import WebSocketUtil from './content_scripts/socket/websocket';

export interface UserInfo {
	client_id: string;
	expires_in: number;
	login: string;
	scopes: string[];
	user_id: string;
}

export interface SockAuthData {
	user: string;
	token: string;
}

// const STREAM_LINK = 'https://www.twitch.tv/kori';
const STREAM_LINK = 'https://www.twitch.tv/tobs';
const CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';
const CALLBACK_URI =
	'https://kabldnfpbfcdkbhbolpdbbppiendepjj.chromiumapp.org/ttv_callback';
const RES_TYPE = 'token';
const AUTH_SCOPE = 'user%3Aread%3Achat';
const uri = `https://id.twitch.tv/oauth2/authorize?force_verify=true&response_type=${RES_TYPE}&client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URI}&scope=${AUTH_SCOPE}`;
// const SOCKET = 'wss://pubsub-edge.twitch.tv/v1';
const IRC_SOCK = 'wss://irc-ws.chat.twitch.tv/'; // easier to debug basic connections

const [state, setState] = createSignal(false);
const [favors, setFavors] = createSignal<number | null>(null);
const [user, setUser] = createSignal<SockAuthData>({ user: '', token: '' });

const ws = new WebSocketUtil(IRC_SOCK);

const getIconPath = (state: boolean): string => {
	const type = state ? 'enabled' : 'disabled';
	const item = Math.ceil(Math.random() * 11); // pull a random koriINSANERACC frame

	return `/public/${type}/insanerac_${type[0]}${item}.png`;
};

const sockAction = (state: boolean) => {
	return state ? 'ws_listen' : 'ws_kill';
};

chrome.runtime.onInstalled.addListener(() => {
	// on extension install, clear any existing data and re-init
	chrome.storage.local.clear();
	chrome.storage.local.set({ state: false });
});

chrome.runtime.onStartup.addListener(() => {
	chrome.storage.local.get(['state', 'auth', 'user'], (res) => {
		setState(res.state);
		chrome.browserAction.setIcon({ path: getIconPath(res.state) });
	});
});

const toggleState = (force: boolean | null = null) => {
	force !== null ?
		setState(force)
	:	setState((prev) => (prev ? false : true));
	chrome.storage.local.set({ state: state() });

	return state();
};

chrome.runtime.onMessage.addListener((req, _sender, sendRes) => {
	if (req.action === 'ws_listen') {
		console.log(user());

		if (!(user().user || user().token)) {
			sendRes({ status: 'error', message: 'must be logged in' });
		}

		ws.connect(user());
		sendRes({ status: 'complete' });

		return true;
	}

	if (req.action === 'ws_kill') {
		ws.disconnect();
		sendRes({ status: 'complete' });

		return true;
	}

	if (req.action === 'curr_state') {
		sendRes({ status: 'complete', data: state() });
		return;
	}

	if (req.action === 'new_state') {
		const force = req.force ? req.force : null;
		toggleState(force);
		sendRes({ status: 'complete', data: state() });
		return true;
	}

	if (req.action === 'auth') {
		chrome.storage.local.get(['auth', 'auth_expiry'], (res) => {
			if (!res.auth) {
				chrome.identity.launchWebAuthFlow(
					{ url: uri, interactive: true },
					(res) => {
						const re = /#access_token=(.*?)&/;
						const oauth = res?.match(re)?.[1];

						// i really could not figure out how to condense this down without indeterminate amounts of refactoring
                        // but it might just be chrome API callback hell plus my retarded chungus life
						const _valid = validate(oauth as string).then((res) => {
							const auth = res.token;
							const user = res.user;
							const auth_expiry = Date.now() + 3_600_000; // revalidate each hour: 3,600,000ms = ~60mins

                            // try getting user color for the UI if/when bothered

							chrome.storage.local.set({
								auth,
								user,
								auth_expiry,
							});
							setUser({
								user: user.login,
								token: auth as string,
							});
							sendRes({
								status: 'complete',
								token: auth,
								user: user,
							});
						});
					}
				);
			} else {

                // this is good enough for now
				console.log('[+] Revalidating auth.');
				const _valid = validate(res.auth as string).then((res) => {
					const auth = res.token;
					const user = res.user;
					const auth_expiry = Date.now() + 3_600_000;

					chrome.storage.local.set({ auth, user, auth_expiry });
					sendRes({
						status: 'complete',
						token: res.token,
						user: res.user,
					});
				});
			}
		});

		return true;
	}

	if (req.action === 'curr_auth') {
		chrome.storage.local.get(['auth', 'user', 'auth_expiry'], (res) => {
			if (res.user && res.token && res.auth_expiry <= Date.now()) {
				// pass token so we can revoke it
				sendRes({
					status: 'error',
					message: 'expired',
					token: res.token,
				});
				return;
			} else {
				// we send a response with the undefined content when user auth info
				// isn't saved locally and handle that case in the sender
				sendRes({
					status: 'complete',
					token: res.auth,
					user: res.user,
				});
			}
		});

		return true;
	}

	if (req.action === 'revoke') {
		chrome.storage.local.get(['auth', 'user'], (res) => {
			const _revoked = revoke(res.auth).then((res) => {
				if (res.status === 'complete') {
					chrome.storage.local.remove([
						'auth',
						'user',
						'auth_expiry',
					]);
					sendRes({ status: 'complete' });
				}
			});
		});

		return true;
	}
});

export const gramble = async (debug: boolean = false) => {
	// double check that we intend to gramble before actually grambling because you never know...
	chrome.runtime.sendMessage({ action: 'curr_state' }, (res) => {
		if (res.data === false) {
			console.log('[x] Gramble disabled, not grambling due to this.');
			return;
		} else {
			predictor();
		}
	});

	const predictor = async () => {
        // query all tabs for a tab that contains the target url
		chrome.tabs.query({}, (tabs) => {
			if (tabs.every((t) => t.url !== STREAM_LINK)) {
				console.log('[x] No Kori tabs open, not grambling.');
				return;
			}
			tabs.forEach((t) => {
				if (t.url === STREAM_LINK) {
					console.log('[+] Kori tab found:', t);

                    // maybe have an option to open kori in the background
					if (!t.id) {
						console.error(
							"[!] Unable to fetch the ID of Kori's tab."
						);
						return;
					}

					chrome.tabs.sendMessage(
						t.id,
						{ action: 'predict' },
						(res) => {
							if (chrome.runtime.lastError) {
								console.error(
									'Error sending message:',
									chrome.runtime.lastError
								);
								return;
							}

							if (res.status === 'complete') {
								console.log(
									'[+] Gramble observer chain completed without issue.'
								);
								return;
							} else {
								console.error(
									'[-] Gramble observer chain encountered an issue and returned without completing:',
									res.message
								);
								return;
							}
						}
					);
				}
			});
		});
	};
};

chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'local') {
		if (changes.state?.newValue != null) {
			// guard against some weird non-boolean state being set - i have no idea why this would happen
			if (typeof changes.state?.newValue !== typeof true) {
				console.error(
					'[!] Returning to default state (disabled): the state was changed to an unknown type.',
					'[!] Expected boolean `state`, got:',
					changes.state.newValue
				);

				// reset state to default (disabled) if we catch on this guard
				setState(false);
				chrome.storage.local.set({ state: false });

				return;
			}

            // set the extension icon to match the toggled state
			chrome.action.setIcon(
				{
					path: getIconPath(changes.state.newValue),
				},
				() => {}
			);

            // run socket (dis)connection function based on state truthiness
			changes.state.newValue ? ws.connect(user()) : ws.disconnect();
		}
	}
});
