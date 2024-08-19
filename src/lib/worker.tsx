import { createSignal } from 'solid-js';
import { validate, revoke } from './content_scripts/requests';

export interface UserInfo {
	client_id: string;
	expires_in: number;
	login: string;
	scopes: string[];
	user_id: string;
}

// const STREAM_LINK = 'https://www.twitch.tv/kori';
const STREAM_LINK = 'https://www.twitch.tv/tobs';
const CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';
const CALLBACK_URI = 'https://kabldnfpbfcdkbhbolpdbbppiendepjj.chromiumapp.org/ttv_callback';
const RES_TYPE = 'token';
const AUTH_SCOPE = 'chat%3Aread';
const uri = `https://id.twitch.tv/oauth2/authorize?force_verify=true&response_type=${RES_TYPE}&client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URI}&scope=${AUTH_SCOPE}`;

const [state, setState] = createSignal(false);
const [favors, setFavors] = createSignal<number | null>(null);

const getIconPath = (state: boolean): string => {
    const type = state ? 'enabled' : 'disabled';
    const item = Math.floor(Math.random() * 11) + 1;

    return `/public/${type}/insanerac_${type[0]}${item}.png`;
}

chrome.runtime.onInstalled.addListener(() => {
	// on extension install, clear any existing data and re-init
	chrome.storage.local.clear();
	chrome.storage.local.set({ state: false });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.state?.newValue != null) {

            // guard against some weird non-boolean state being set
            if (typeof changes.state?.newValue !== typeof true) {
                console.error('[!] Invalid state found when querying state. Cannot set ext icon.');
                return;
            }

            chrome.action.setIcon({
                path: getIconPath(changes.state.newValue)
            }, () => {
                console.log('[+] Updated icon.');
            });
        }
    }
    // for (let [key, { oldValue, newValue  }] of Object.entries(changes)) {
    //     console.log(
    //         `stored key => '${key}' in ns => '${namespace} is changed:`,
    //         `${oldValue} => ${newValue}`
    //     );
    // }
});

// chrome.runtime.reload();
chrome.runtime.onStartup.addListener(() => {
	chrome.storage.local.get(['state', 'auth', 'user'], (res) => {
		setState(res.state);
        chrome.browserAction.setIcon({ path: getIconPath(res.state) });
	});
});

const toggleState = () => {
	setState((prev) => (prev ? false : true));
	chrome.storage.local.set({ state: state() });

	return state();
};

chrome.runtime.onMessage.addListener((req, _sender, sendRes) => {
	if (req.action === 'curr_state') {
		sendRes({ status: 'complete', data: state() });
		return true;
	}

	if (req.action === 'new_state') {
		toggleState();
		sendRes({ status: 'complete', data: state() });
		return true;
	}

	if (req.action === 'auth') {
		chrome.storage.local.get(['auth'], (res) => {
			if (!res.auth) {
				chrome.identity.launchWebAuthFlow({ url: uri, interactive: true }, (res) => {
					const re = /#access_token=(.*?)&/;
					const oauth = res?.match(re)?.[1];

                    // i really could not figure out how to condense this down but it might just be the callback hell
                    // that is the chrome extension API meeting its match with my retarded chungus life
					const _valid = validate(oauth as string).then((res) => {
                        // console.log(res);
                        chrome.storage.local.set({ auth: res.token });
                        chrome.storage.local.set({ user: res.user });
                        sendRes({ status: 'complete', token: res.token, user: res.user });
                    });

                    // console.log(valid);
				});
			} else {
				const _valid = validate(res.auth as string).then((res) => {
                    // console.log(res);
                    chrome.storage.local.set({ auth: res.token });
                    chrome.storage.local.set({ user: res.user });
                    sendRes({ status: 'complete', token: res.token, user: res.user });
                });

                // console.log('[+] Auth ok (from localstorage): ', valid);
			}
		});

        return true;
	}

    if (req.action === 'curr_auth') {
        chrome.storage.local.get(['auth', 'user'], (res) => {
            console.log(res);
            sendRes({ status: 'complete', token: res.auth, user: res.user });
        });

        return true;
    }

    if (req.action === 'revoke') {
        chrome.storage.local.get(['auth', 'user'], (res) => {
            // console.log(res.auth, res.user);
            const _revoked = revoke(res.auth).then((res) => {
                if (res.status === 'complete') {
                    chrome.storage.local.remove(['auth', 'user']);
                    sendRes({ status: 'complete' });
                }
            });
        });

        return true;
    }

});

export const gramble = async () => {
	// make sure we intend to gramble before actually gramblind
	// shouldn't have a ws connection open anyway, but as a backup this is good
	chrome.runtime.sendMessage({ action: 'curr_state' }, (res) => {
		if (res.data === false) {
			console.log('[x] Gramble disabled, not grambling due to this.');
			return;
		} else {
			predictor();
		}
	});

	const predictor = async () => {
		chrome.tabs.query({}, (tabs) => {
			if (tabs.every((t) => t.url !== STREAM_LINK)) {
				console.log('[x] No Kori tabs open, not grambling.');
				return;
			}
			tabs.forEach((t) => {
				if (t.url === STREAM_LINK) {
					console.log('[+] Kori tab found:', t);

					if (!t.id) {
						console.error("[!] Unable to fetch the ID of Kori's tab.");
						return;
					}

					chrome.tabs.sendMessage(t.id, { action: 'predict' }, (res) => {
						if (chrome.runtime.lastError) {
							console.error('Error sending message:', chrome.runtime.lastError);
							return;
						}

						if (res.status === 'complete') {
							console.log('[+] Gramble observer chain completed without issue.');
							return;
						} else if (res.status === 'error') {
							console.error(
								'[-] Gramble observer chain encountered an issue and returned without completing:',
								res.message
							);
							return;
						} else {
							console.error(
								'[-] Idk what happened but we fell all the way through (maybe cry about it).'
							);
							return;
						}
					});
				}
			});
		});
	};
};
