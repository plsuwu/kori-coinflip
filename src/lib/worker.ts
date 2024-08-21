import { STREAM_LINK, IRC_SOCKET_URL, auth_uri } from './util';
import { validate, revoke } from './content_scripts/requests';
import WebSocketUtil from './content_scripts/socket/websocket';
import './content_scripts/autopredict.tsx';

export interface UserInfo {
	client_id: string;
	expires_in: number;
	login: string;
	scopes: string[];
	user_id: string;
}

// export const debugGramble = () => {
// 	gramble();
// };

const gramble = () => {
	// double check that we intend to gramble before actually grambling
	chrome.runtime.sendMessage({ action: 'curr_state' }, (res) => {
		if (res.data === false) {
			console.log('[x] Gramble disabled, not grambling due to this.');
			return;
		} else {
			predictor();
		}
	});
};

const predictor = () => {
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
					console.error("[!] Unable to fetch the ID of Kori's tab.");
					return;
				}

				chrome.tabs.sendMessage(t.id, { action: 'predict' }, (res) => {
					if (chrome.runtime.lastError) {
						console.error(
							'Error sending message:',
							chrome.runtime.lastError
						);
						return;
					}

					return;
				});
			}
		});
	});
};

const ws = new WebSocketUtil(IRC_SOCKET_URL);

const getIconPath = (state: boolean): string => {
	const type = state ? 'enabled' : 'disabled';
	const item = Math.ceil(Math.random() * 11); // pull a random koriINSANERACC frame

	return `public/${type}/insanerac_${type[0]}${item}.png`;
};

chrome.runtime.onInstalled.addListener(() => {
	// on extension install, clear any existing data and re-init
	chrome.storage.local.clear();
	chrome.storage.local.set({ state: false });
});

chrome.runtime.onStartup.addListener(() => {
	chrome.storage.local.get(['state', 'auth', 'user'], (res) => {
		chrome.action.setIcon({ path: getIconPath(res.state) });
		// if (res.auth) {
		//     // re-validate
		// }
	});
});

const toggleState = (curr: boolean) => {
	const newState = curr ? false : true;
	chrome.storage.local.set({ state: newState });

	return newState;
};

// make this a switch statement lmaooo
chrome.runtime.onMessage.addListener((req, _, next) => {
	if (req.action === 'gramble') {
		console.log('[+] Flipping...');
		gramble();
	}

	if (req.action === 'debug') {
		console.log('DEBUGGING CONTENT SCRIPT:', req.sent_by, req);
		next({ caught: 'true', message: 'ok' });
	}

	if (req.action === 'sock_closed') {
		chrome.storage.local.get(['state'], (res) => {
			if (res.state != null && res.state === false) {
				console.log(
					'[*] State was already off, so sock listener was manually toggled closed.'
				);
				next({
					status: 'completed',
					state: res.state,
					message: 'manually closed',
				});
			} else if (res.state) {
				console.log(
					'[*] State was true, so sock listener closed programmatically.'
				);

				const newState = toggleState(false);
				// chrome.storage.local.set({ state: false });
				next({
					status: 'completed',
					state: newState,
					message: 'self-closed',
				});
			}
		});
	}

	if (req.action === 'curr_state') {
		chrome.storage.local.get(['state'], (res) => {
			if (res.state != null) {
				next({ status: 'complete', data: res.state });
			}
		});
	}

	if (req.action === 'new_state') {
		chrome.storage.local.get(['state'], (res) => {
			if (res.state != null) {
				const newState = toggleState(res.state);
				next({ status: 'complete', data: newState });
			}
		});
	}

	if (req.action === 'auth') {
		chrome.storage.local.get(['auth', 'auth_expiry'], (res) => {
			if (!res.auth) {
				chrome.identity.launchWebAuthFlow(
					{ url: auth_uri, interactive: true },
					(res) => {
						const re = /#access_token=(.*?)&/;
						const oauth = res?.match(re)?.[1];

						// condense this + the else block
						const _valid = validate(oauth as string).then((res) => {
							const auth = res.token;
							const user = res.user;

							// get expiry to work when time permits:
							const auth_expiry = Date.now() + 3_600_000; // revalidate each hour: 3,600,000ms = ~60mins

							// try getting user color for the UI if/when bothered

							chrome.storage.local.set({
								auth,
								user,
								auth_expiry,
							});

							next({
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
					next({
						status: 'complete',
						token: res.token,
						user: res.user,
					});
				});
			}
		});
	}

	if (req.action === 'curr_auth') {
		chrome.storage.local.get(['auth', 'user', 'auth_expiry'], (res) => {
			if (res.user && res.token && res.auth_expiry <= Date.now()) {
				// pass token so we can revoke it
				next({
					status: 'error',
					message: 'expired',
					token: res.token,
				});
				return;
			} else {
				// we send a response with the undefined content when user auth info
				// isn't saved locally and handle that case in the sender
				next({
					status: 'complete',
					token: res.auth,
					user: res.user,
				});
			}
		});
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
					next({ status: 'complete' });
				}
			});
		});
	}

	return true;
});

chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'local') {

		// when a new enabled/disabled state is written to localstorage, check its boolean value and
		// run the relevant handler for that state
		if (changes.state?.newValue != null) {

            // guard for non-bool state and reset to a non-destructive value
			if (typeof changes.state?.newValue !== typeof true) {
				console.error(
					'[!] Returning to default state (disabled): the state was changed to an unknown type.',
					'[!] Expected boolean `state`, got:',
					changes.state.newValue
				);
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
			changes.state.newValue ?
				chrome.storage.local.get(['user', 'auth'], (res) => {
					const user = res.user.login;
					const token = res.auth;
					const channel = 'kori';

					console.log(
						'USER:',
						user,
						'TOKEN:',
						token,
						'CHANNEL:',
						channel
					);

					// ws.connect resolves when a `!brb` is received, at which point we call the event
					// loop again, reconnecting to the socket
                    //
                    // this is just barely recognisable as javascript i fucking hate this nightmarish callback hell
					const loop = () => {
						chrome.storage.local.get(['state'], (res) => {
							if (res.state) {
								ws.connect({ user, token, channel }).then(
									(ws_res) => {
										console.log(ws_res);

										predictor();
										ws.disconnect().then((_) => {
											loop();
										});
									}
								);
							}
						});
					};

					loop();
				})
			:	ws.disconnect();
		}
	}
});
