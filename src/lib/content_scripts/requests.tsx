const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';
const REVOKE_URL = 'https://id.twitch.tv/oauth2/revoke';
const CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';

/*
* utility functions for fetch requests to validate/revoke oauth2 tokens
* */

export const revoke = async (token: string, url: string = REVOKE_URL) => {
	console.log('[-] Attempting to revoke token: ', token);

	// curl -X POST 'https://id.twitch.tv/oauth2/revoke' \
	// -H 'Content-Type: application/x-www-form-urlencoded' \
	// -d 'client_id=<client id goes here>&token=<access token goes here>'
	let revoked = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: CLIENT_ID,
			token: token,
		}),
	});

	if (revoked.status !== 200) {
		console.log('[-] There was an issue revoking an access token:', revoked);
		return { status: 'error', message: revoked };
	}

	console.log('[+] Successfully revoked access token: ', revoked);
	return { status: 'complete', response: revoked };
};


export const validate = async (token: string, url: string = VALIDATE_URL) => {
	console.log('[+] Attempting to validate token: ', token);

	// curl -X GET 'https://id.twitch.tv/oauth2/validate' \
	// -H 'Authorization: OAuth <access token>'
	const oauthHeader = `OAuth ${token}`;
	let validated = await fetch(url, {
		headers: {
			Authorization: oauthHeader,
		},
	});

	if (!validated.ok) {
		console.error('[!] Error while validating token: ', validated);
		return { status: 'error', message: validated };
	}

	const res = await validated.json();
	return { status: 'complete', token, user: res };
};
