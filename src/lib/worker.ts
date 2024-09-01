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

export const gramble = (debug: boolean = false) => {
	// double check that we intend to gramble before actually grambling
    // should only occur when manually clicking in debug mode
	chrome.runtime.sendMessage({ action: 'curr_state' }, (res) => {
		if (res.state === false && !debug) {
			console.log('[x] Gramble disabled, not grambling due to this.');
			return;
		} else {
			predictor();
		}
	});
};

const predictor = () => {
	// query all tabs for one containing our target url and the predict action
	// message to the content script in that tab
	chrome.tabs.query({}, (tabs) => {
		if (tabs.every((t) => t.url !== STREAM_LINK)) {
			console.log('[x] No Kori tabs open, unable to gramble.');
			return;
		}

        // if multiple kori tabs are open, use the first one
        //
        // eventually want to try injecting ourselves into a different kori tab on hitting a
        // `chrome.runtime.lastError`, though this probably shouldn't happen
		const kori = tabs.filter((tab) => tab.url === STREAM_LINK)[0];

		if (kori) {
			console.log('[+] Using this Kori tab:', kori);
			chrome.tabs.sendMessage(
				kori.id as number,
				{ action: 'predict' },
				(_) => {
					if (chrome.runtime.lastError) {
						console.error(
							'Error sending message:',
							chrome.runtime.lastError
						);
						return;
					}

					return;
				}
			);
		}
	});
};

const ws = new WebSocketUtil(IRC_SOCKET_URL);

const getIconPath = (state: boolean): string => {
	const type = state ? 'enabled' : 'disabled';

	// index random koriINSANERACC frame
	const item = Math.ceil(Math.random() * 11);

	return `public/${type}/insanerac_${type[0]}${item}.png`;
};

chrome.runtime.onInstalled.addListener(() => {
	// on extension install, clear any existing data and re-init
	chrome.storage.local.clear();
	chrome.storage.local.set({ state: false, debug: false });
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
	return newState;
};

// make this a switch statement lmaooo
chrome.runtime.onMessage.addListener((req, _, next) => {

    // runs the main gramble action
	if (req.action === 'gramble') {
		console.log('[+] Flipping...');
		gramble();
	}

    // debugger value getter & setter
	if (req.action === 'get_debug') {
        chrome.storage.local.get(['debug'], (res) => {
            next({ status: 'complete', debug: res.debug });
        })
    }

    if (req.action === 'set_debug') {
        chrome.storage.local.get(['debug'], (res) => {
            const newDebug = res.debug ? false : true;
            chrome.storage.local.set({ debug: newDebug });

            next({ status: 'complete', debug: newDebug });
        });
    }

    // sock self-closed checker (if the socket was closed by the socket handler itself
    // we want this to reflect in the extension's state
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
				next({
					status: 'completed',
					state: newState,
					message: 'self-closed',
				});
			}
		});
	}

    // extension state (enabled/disabled) getter & setter
	if (req.action === 'curr_state') {
		chrome.storage.local.get(['state'], (res) => {
			if (res.state != null) {
				next({ status: 'complete', state: res.state });
			}
		});
	}

	if (req.action === 'new_state') {
		chrome.storage.local.get(['state'], (res) => {
			if (res.state != null) {
				const newState = toggleState(res.state);
				chrome.storage.local.set({ state: newState });
				next({ status: 'complete', state: newState });
			}
		});
	}

    // authentication/twitch oauth flow and credential storage
	if (req.action === 'auth') {
		chrome.storage.local.get(['auth', 'auth_expiry'], (res) => {
			const writeValidity = (auth: string) => {
				validate(auth).then((res) => {
					if (res.status === 'error') {
						let message: string =
							'Unhandled error, please try again momentarily.';

                        // report basic login errors
						switch (res.message?.status) {
							case 401:
								message =
									"(401) TTV couldn't validate the login token:invalid credentials supplied.";
								break;
							case 500:
								message =
									"(500) TTV couldn't validate the login token: Server error (try again shortly).";
								break;
							default:
								break;
						}
						chrome.storage.local.set({
							auth: 'error',
							message,
						});
						next({ status: 'error', message });
						return;
					}
					const auth = res.token;
					const user = res.user;

					// get expiry to work when time permits:
					// const auth_expiry = Date.now() + 3_600_000; // revalidate each hour: 3,600,000ms = ~60mins
					const auth_expiry = Date.now() + 1;

					// could do a user color for the UI if/when bothered

					chrome.storage.local.set({
						auth,
						user,
						auth_expiry,
					});

					next({
						status: 'completed',
						message: null,
						token: auth,
						user: user,
					});
				});
			};

            // report errors or otherwise undefined behavior
			if (!res.auth || res.auth === 'error') {
				chrome.identity.launchWebAuthFlow(
					{ url: auth_uri, interactive: true },
					(res) => {
						let status = 'complete';
						let message: any = null;

						if (chrome.runtime.lastError) {
							console.error(
								'[!] Error during OAuth login: ',
								chrome.runtime.lastError
							);

							status = 'error';
							message =
								'OAuth login error: ' +
								chrome.runtime.lastError.message?.toLowerCase();

							chrome.storage.local.set({
								auth: status,
								message: message,
							});

							next({ status, message });
							return;
						}

						const re = /#access_token=(.*?)&/;
						const oauth = res?.match(re)?.[1];

						// calls the validate() fetch fn and writes the result to local
						// storage, responding to the runtime message with the result
						writeValidity(oauth as string);
					}
				);
			} else {
				// this is good enough for now
				console.log('[+] Revalidating auth.');
				writeValidity(res.auth as string);
			}
		});
	}

	if (req.action === 'curr_auth') {
		chrome.storage.local.get(
			['auth', 'user', 'auth_expiry', 'message'], // cbf doing expiry.
			(res) => {
				if (res.auth && res.auth === 'error') {
					next({
						status: 'error',
						message: res.message,
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
			}
		);
	}

    // report the logout to twitch API to stop the token from being used in
    // future sessions
	if (req.action === 'revoke') {
		chrome.storage.local.get(['auth', 'user'], (res) => {
			revoke(res.auth).then((res) => {
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

// runtime listener for changed `{ key: value }` pairs in chrome's storage
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

					// ws.connect promise holds a loop that resolves when a `!brb` is received.
                    // when the ws.connect function resolves, we call `predictor()` before we disconnect
                    // & re-connect by calling the ws.connect loop again. this loops until the extension state is
                    // toggled false.
					//
					// 1/3rd of this program (and chrome extension javascript generally) is wrapping chrome
                    // runtime messages in `.then(() ...` callbacks, which is making it very difficult to return
                    // values from async function calls >:(
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
