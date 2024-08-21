import { createSignal, onMount, type Component } from 'solid-js';
// import { debugGramble } from './lib/worker';
import { Toggle } from './lib/components/Toggle';
import { Auth } from './lib/components/Auth';
import { revoke } from './lib/content_scripts/requests';
import { ClearLocal } from './lib/components/ClearLocal';

export interface UserData {
	client_id?: string;
	expires_in?: number;
	login?: string;
	scopes?: string[];
	user_id?: string;
}

const App: Component = () => {
	const [state, setState] = createSignal(false);
	const [token, setToken] = createSignal('');
	const [user, setUser] = createSignal<UserData>({});

	onMount(() => {
		chrome.runtime.sendMessage({ action: 'curr_auth' }, (res) => {
			console.log('auth res: ', res);
			if (res.status === 'error') {
				if (res.message === 'expired') {
					// re-validate
				}
			} else if (res.status === 'complete' && res.user && res.token) {
				setToken(res.token);
				setUser(res.user);
			}
		});

		chrome.runtime.sendMessage({ action: 'curr_state' }, (res) => {
			console.log(res);
			setState(res.data);
		});
	});

	const fetchToken = async () => {
		chrome.runtime.sendMessage({ action: 'auth' }, (res) => {
			console.log(res);
			setToken(res.token);
			setUser(res.user);
		});
	};

	const logout = async () => {
		chrome.runtime.sendMessage({ action: 'revoke' }, (_res) => {
			console.log(_res);
			setToken('');
			setUser({});
		});
	};

	const toggle = () => {
		chrome.runtime.sendMessage({ action: 'new_state' }, (res) => {
			console.log(res);

			setState(res.data);
		});
	};

	const clearAllData = () => {
		chrome.runtime.sendMessage(
			{ action: 'new_state', force: false },
			(res) => {
				console.log(res);

				setState(res.data);
				logout();
			}
		);
	};

	return (
		<div class='flex min-h-[450px] max-h-[450px] flex-col justify-items-center'>
			<div class='flex w-full flex-col items-center justify-center bg-black/25 py-4'>
				<span class='text-center text-3xl font-semibold text-kori-light-blue'>
					kori coinflip
				</span>
			</div>
			<div class='w-full'></div>
			<div class='flex flex-col m-1'>
				<Auth
					token={token()}
					user={user()}
					logout={logout}
					fetchToken={fetchToken}
				/>
			</div>
			<div class='my-6 flex flex-1 flex-col flex-grow items-center justify-start'>
				<Toggle
					user={user().login}
					state={state()}
					handlerFn={toggle}
				/>
			</div>
			<div class='flex flex-row-reverse px-2 py-1'>
				<ClearLocal handleParentEvent={clearAllData} />
			</div>
		</div>
	);
};

export default App;
