import { createSignal, onMount, type Component } from 'solid-js';
import { gramble } from './lib/worker';
import { Toggle } from './lib/components/Toggle';
import { Auth } from './lib/components/Auth';

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
    const [loading, setLoading] = createSignal<boolean>(false);

	onMount(() => {

		chrome.runtime.sendMessage({ action: 'curr_auth' }, (res) => {
			setToken(res.token);
			setUser(res.user);
		});

        chrome.runtime.sendMessage({ action: 'curr_state' }, (res) => {
            setState(res.data);
        });
    });

	const fetchToken = async () => {
        setLoading(true);
		chrome.runtime.sendMessage({ action: 'auth' }, (res) => {
			setToken(res.token);
			setUser(res.user);
		});

        setLoading(false);
	};

	const logout = async () => {
        setLoading(true);
		chrome.runtime.sendMessage({ action: 'revoke' }, (_res) => {
			setToken('');
			setUser({});
		});

        setLoading(false);
	};

	const toggle = () => {
		chrome.runtime.sendMessage({ action: 'new_state' }, (res) => {
			setState(res.data);
		});
	};

	const runDebugGramble = () => {
		gramble();
	};

	return (
		<>
			<div class='flex items-center justify-center'>
				<button onclick={runDebugGramble}>debug gramble</button>
			</div>
			<div>
				<Auth token={token()} user={user()} logout={logout} fetchToken={fetchToken} loading={loading()} />
			</div>
			<div class='my-12 flex flex-row items-center justify-center'>
				<Toggle state={state()} handlerFn={toggle} />
			</div>
		</>
	);
};

export default App;
