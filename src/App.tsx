import { createSignal, onMount, type Component } from 'solid-js';
import { debugGramble } from './lib/worker';
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
            console.log('auth res: ',res);
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

	const runDebugGramble = () => {
        // console.log('gramelb');
		debugGramble();
	};

	const clearAllData = () => {
		chrome.runtime.sendMessage({ action: 'new_state', force: false }, (res) => {
            console.log(res);

			setState(res.data);
            logout();
		});
	};

	return (
		<>
			<div class='flex items-center justify-center'>
				<button onclick={runDebugGramble}>debug gramble</button>
			</div>
			<div>
				<Auth
					token={token()}
					user={user()}
					logout={logout}
					fetchToken={fetchToken}
				/>
			</div>
			<div class='my-12 flex flex-row items-center justify-center'>
				<Toggle user={user().login} state={state()} handlerFn={toggle} />
			</div>
			<div>
				<ClearLocal handleParentEvent={clearAllData} />
			</div>
		</>
	);
};

export default App;
