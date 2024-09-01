const TTV_CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';
const AUTH_CALLBACK_URI = `https://${chrome.runtime.id}.chromiumapp.org/ttv_callback`;
// const AUTH_CALLBACK_URI = `http://localhost/ttv_callback`;

const AUTH_SCOPE = 'chat%3Aread';
const RES_TYPE = 'token';

const STREAM_LINK = 'https://www.twitch.tv/kori';
// const STREAM_LINK = 'https://www.twitch.tv/tobs';

const IRC_SOCKET_URL = 'wss://irc-ws.chat.twitch.tv/';
const auth_uri = `https://id.twitch.tv/oauth2/authorize?force_verify=true&response_type=${RES_TYPE}&client_id=${TTV_CLIENT_ID}&redirect_uri=${AUTH_CALLBACK_URI}&scope=${AUTH_SCOPE}`;

interface StoredObject<T> {
	[key: string]: T;
}

interface OAuthInitial {
	status: string;
	message?: string;
	newAuth?: string;
}

export const toggleState = (curr: boolean) => {
	const newState = curr ? false : true;
	return newState;
};


export const sockResetToggle = (state: StoredObject<boolean>) => {
	if (state != null && state.state === false) {
		return {
			status: 'completed',
			state: state.state,
			message: 'manually closed',
		};
	}

	if (state.state) {
		const newState = toggleState(false);
		return {
			status: 'completed',
			state: newState,
			message: 'self-closed',
		};
	}
};

export { STREAM_LINK, IRC_SOCKET_URL, AUTH_CALLBACK_URI, auth_uri };
