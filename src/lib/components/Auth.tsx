import { Component, createSignal, onMount } from 'solid-js';

// https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/
//
// https://kabldnfpbfcdkbhbolpdbbppiendepjj.chromiumapp.org/ttv_callback#access_token=zvoe4bde7kdc396ssr0y5u67kjj9ee&scope=chat%3Aread&token_type=bearer

export const Auth: Component = () => {
	const [responseData, setResponseData] = createSignal<string | undefined>(
		undefined
	);

	// chrome.storage.local.get(['oauth_token'], (res) => {
	// 	if (res.oauth_token !== undefined) {
	// 		console.log('[+] Token (DEBUG ONL): ', res.oauth_token);
	// 	}
	// });

    // const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';
	const CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';
	const CALLBACK_URI =
		'https://kabldnfpbfcdkbhbolpdbbppiendepjj.chromiumapp.org/ttv_callback';
	const RES_TYPE = 'token';
	const AUTH_SCOPE = 'chat%3Aread';

	const fetchToken = () => {
		const uri = `https://id.twitch.tv/oauth2/authorize?force_verify=true&response_type=${RES_TYPE}&client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URI}&scope=${AUTH_SCOPE}`;
		chrome.identity.launchWebAuthFlow(
			{ url: uri, interactive: true },
			function (response_url) {
				if (response_url) {
					// window.open(response_url, '_blank')?.focus();
					const re = /#access_token=(.*?)&/;
					const oauth_token = response_url.match(re)?.[1];
					if (oauth_token) {
                        chrome.storage.local.set({ oauth_token });
					}
				}
			}
		);
	};

	return (
		<>
			<meta></meta>
			<button onclick={fetchToken} class='m-1 text-[0.7rem] hover:bg-kori-light-blue/30 hover:text-kori-text/75 transition-colors duration-300 ease-in-out px-0.5 py-px border-kori-light-blue border rounded-md' >Connect to Twitch</button>
		</>
	);
};
