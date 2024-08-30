import { createSignal, onMount, type Component } from 'solid-js';
// import { debugGramble } from './lib/worker';
import { Toggle } from './lib/components/Toggle';
import { Auth } from './lib/components/Auth';
import { validate } from './lib/content_scripts/requests';
import { ClearLocal } from './lib/components/ClearLocal';
import { gramble } from './lib/worker';

export interface UserData {
	client_id?: string;
	expires_in?: number;
	login?: string;
	scopes?: string[];
	user_id?: string;
}

interface AuthErr {
	error: boolean;
	message?: string;
}

const App: Component = () => {
	const [err, setErr] = createSignal<AuthErr>({ error: false, message: '' });
	const [state, setState] = createSignal(false);
	const [token, setToken] = createSignal('');
	const [user, setUser] = createSignal<UserData>({});
	const [debug, setDebug] = createSignal<boolean>(false);

	onMount(() => {
		chrome.runtime.sendMessage({ action: 'curr_auth' }, (res) => {
			if (res.status === 'error') {
				if (res.message === 'expired') {
					validate(res.token);
				} else {
					setErr({ error: true, message: res.message });
				}
			} else if (res.status === 'complete' && res.user && res.token) {
				setToken(res.token);
				setUser(res.user);
			}
		});

		chrome.runtime.sendMessage({ action: 'curr_state' }, (res) => {
			setState(res.state);
		});
		chrome.runtime.sendMessage({ action: 'get_debug' }, (res) => {
			setDebug(res.debug);
		});
	});

	const fetchToken = async () => {
		chrome.runtime.sendMessage({ action: 'auth' }, (res) => {
			if (res.status === 'error') {
				setErr({ error: true, message: res.message });
				return;
			}
			setToken(res.token);
			setUser(res.user);
		});
	};

	const toggleDebugger = () => {
		chrome.runtime.sendMessage({ action: 'set_debug' }, (res) => {
			setDebug(res.debug);
		});
	};

	const logout = async () => {
		if (state() === true) {
			chrome.runtime.sendMessage({ action: 'new_state' }, () => {});
		}

		chrome.runtime.sendMessage({ action: 'revoke' }, (_) => {
			setToken('');
			setUser({});
		});
	};

	const toggle = () => {
		chrome.runtime.sendMessage({ action: 'new_state' }, (res) => {
			setState(res.state);
		});
	};

	const clearAllData = () => {
		chrome.runtime.sendMessage(
			{ action: 'new_state', force: false },
			(res) => {
				setState(res.state);
				logout();
			}
		);
	};

	const clearErr = () => {
		chrome.storage.local.remove(['auth']);
		setErr({ error: false, message: '' });
		return;
	};

	return (
		<div class='flex max-h-[450px] min-h-[450px] flex-col justify-items-center'>
			<div class='flex w-full flex-col items-center justify-center bg-black/25 py-4'>
				<span class='text-center text-3xl font-semibold text-kori-light-blue'>
					kori coinflip
				</span>
			</div>
			<div class='w-full'></div>
			{debug() && (
				<button onclick={() => gramble(true)}>debug gram,bler</button>
			)}
			<div class='m-1 flex flex-col'>
				<Auth
					token={token()}
					user={user()}
					logout={logout}
					fetchToken={fetchToken}
				/>
			</div>
			<div class='my-6 flex flex-1 flex-grow flex-col items-center justify-start'>
				<Toggle
					user={user().login}
					state={state()}
					handlerFn={toggle}
				/>

				{err().error ?
					<div>
						<div class='mx-6 mt-8 flex flex-col items-center justify-center rounded-md border border-red-400 p-2 text-sm'>
							<div class='flex w-full flex-row justify-between px-2 text-red-400'>
								<div class='p-2 text-red-300'>
									Login failed:
								</div>
								<button
									class='-pt-1 relative -right-4 -top-2 rounded-md p-2 px-4 transition-all duration-200 ease-in-out hover:text-red-400/55'
									onclick={clearErr}
								>
									x
								</button>
							</div>
							<p class='mx-4 mt-3 px-2 pb-2 text-xs italic text-red-100/90'>
								{err().message}
							</p>
						</div>
					</div>
				:	<></>}
			</div>
			<div class='flex flex-row-reverse justify-around px-px py-1'>
				<ClearLocal handleParentEvent={clearAllData} />
				<div class=''>
					<button onclick={toggleDebugger}>
						debug (
						<span
							class={`${debug() ? 'text-kori-light-blue' : 'text-kori-mid'}`}
						>
							{debug() ? 'on' : 'off'}
						</span>
						)
					</button>
				</div>
			</div>
		</div>
	);
};

export default App;
