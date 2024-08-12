import { createSignal, onMount, type Component } from 'solid-js';
import { Toggle } from './lib/components/Toggle';
import { Auth } from './lib/components/Auth';
import { revoke } from './lib/worker';
import { DebugBtn } from './lib/components/DebugBtn';

const App: Component = () => {
	const textOptions = ['off', 'on'];
	const [enabled, setEnabled] = createSignal(false);
	const [text, setText] = createSignal(textOptions[0]);
	const [auth, setAuth] = createSignal<string | undefined>(undefined);
	const [username, setUsername] = createSignal<string | undefined>(undefined);

	onMount(() => {
		chrome.storage.local.get(['enabled'], (result) => {
			if (result.enabled !== undefined) {
				setEnabled(result.enabled);
			}
		});

		chrome.storage.local.get(['oauth_token'], (result) => {
			if (result.oauth_token !== undefined) {
				setAuth(result.oauth_token);
			}
		});

		chrome.storage.local.get(['user_info'], (result) => {
			if (result.user_info) {
				const uname = result.user_info.login;
				setUsername(uname);
			}
		});
	});

	const clearToken = () => {
		// this check should ensure our token is defined before trying to
		// revoke it
		// revoke(token);

		setUsername(undefined);
		chrome.storage.local.remove(['user_info']);
		setAuth(undefined);
		chrome.storage.local.remove(['oauth_token']);
	};

	const toggle = () => {
		// flip true/false state
		const state = !enabled();
		const ref = state ? 'on' : 'off';

		setEnabled(state);
		setText(ref);
		chrome.storage.local.set({ enabled: state, text: ref }, () => {
			console.log('[+] Setting new state: ', state);
		});
		chrome.runtime.sendMessage({ type: 'STATE_CHANGED', enabled: state });
	};

	return (
		<>
			{!auth() && (
				<div>
					<Auth />
				</div>
			)}
			{username() && (
				<div class='m-1 flex flex-row items-start justify-between'>
					<div>
						omg hiii{' '}
						<a
							href={`https://twitch.tv/${username()}`}
							target='_blank'
							class='rounded-md bg-kori-light-blue/40 px-0.5 py-px'
						>
							@{username()}
						</a>
					</div>
					<button
						class='rounded-md border border-kori-light-blue px-0.5 py-px text-[0.7rem] transition-colors duration-300 ease-in-out hover:bg-kori-light-blue/30 hover:text-kori-text/75'
						onclick={() => clearToken()}
					>
						log out
					</button>
				</div>
			)}
			<div>
				<div class='flex flex-col items-center justify-center text-xl font-semibold'>
					<div class='my-8'>kori coinflip</div>
					<div class='relative mx-8 mb-8 inline-flex flex-1 justify-center'></div>
					<Toggle
						text={text()}
						state={enabled()}
						handlerFn={toggle}
					/>
				</div>
			</div>
			<DebugBtn />
		</>
	);
};

export default App;
