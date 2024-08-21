import { WebSocketClient } from 'vite';
import { debugGramble } from '../../worker';
// import { SockAuthData } from '../../worker';
interface AuthData {
	user: string;
	token: string;
	channel: string;
}

// websocket connection handler
class WebSocketUtil {
	private sock: WebSocket | null = null;
	private url: string;
	private auth?: string[];

	constructor(url: string) {
		this.url = url;
	}

	public connect(auth: AuthData): Promise<any> {
		return new Promise((resolve, reject) => {
			if (this.sock) {
				reject('[!] Already connected and listening.');
				return;
			}
			this.auth = this.templatedAuth(auth.user, auth.token, auth.channel);
			this.sock = new WebSocket(this.url);

			this.sock.onopen = () => {
				console.log('[+] Socket initiated, waiting for OPEN state.');
				if (this.sock === null) {
					reject('idk lmao');
					return;
				}

				waitOnSock(this.sock).then((_) => {
					if (this.auth && this.ready()) {
						for (const msg of this.auth) {
							console.info('[^]:', msg);
							this.sock?.send(msg);
						}

						/* loop socket keepalive */
						const ping = () => {
							if (this.sock !== null) {
								setTimeout(() => {
									console.log(
										'[*] Keepalive placeholder :)) (EXTEND TIMER THO LMAO).'
									);
									ping();
								}, this.jitter());
							}
						};

						ping();
					}
				});
			};

			this.sock.onerror = (err) => {
				console.error('[!] Socket error:', err);
				reject('[-] err');
			};

			this.sock.onmessage = (event) => {
				const run = this.ircParser(event.data, auth.channel, '!brb');
				if (run) {
					// we want gramble, resolve the promise to allow worker to
					// execute on main thread
					resolve('gramble :)');
					return true;
				}
			};

			this.sock.onclose = () => {
				console.log('[-] Closing socket connection.');
				// this.sock = null;

				return;
				// chrome.runtime.sendMessage({ action: 'sock_closed' }, (res) => {
				// 	console.log('[-] State is now disabled:', res);
				// });
			};

			// resolve();
		});
	}

	public async disconnect(): Promise<void> {
		if (this.sock) {
			this.sock.close();
			this.sock = null;
			return;
		} else {
			console.log(
				'[?] Tried to close a connection with no connection in socket.\n',
				'(this is probably normal behaviour).'
			);
		}
	}

	public ready(): boolean {
		if (this.sock && this.sock.readyState === WebSocket.OPEN) {
			return true;
		}

		return false;
	}

	private pong(): void {
		console.log(
			`[->]<${new Date(Date.now()).toLocaleTimeString()}> Responding to a PING frame`
		);
		this.sock?.send('PONG');
	}

	// needs to be changed to accomodate the eventsub but for testing this is fine
	private templatedAuth(
		login: string,
		auth: string,
		channel: string
	): string[] {
		const template = [
			'CAP REQ :twitch.tv/tags twitch.tv/commands',
			`PASS oauth:${auth}`,
			`NICK ${login}`,
			`USER ${login} 8 * :${login}`,
			// `JOIN #${channel}`,

			`JOIN #plss`, // debrug
		];

		return template;
	}

	private ircParser(msg: string, channel: string, run: string): boolean {
		console.log('[<-] incoming raw data: ', msg);
		if (msg === 'PING :tmi.twitch.tv') {
			this.pong();
		}

		if (msg.includes('PRIVMSG')) {
			const re =
				/^.*?:(\w+!\w+@\w+)\.tmi\.twitch\.tv\sPRIVMSG\s#(\w+)\s:(.*$)/gm;
			const matches = re.exec(msg);

			if (matches) {
				console.log(matches);
				// const broadcaster = `${channel}!${channel}@${channel}`;
				const broadcaster = 'plss!plss@plss';
				if (
					matches[1] === broadcaster &&
					// matches[2] === channel &&
					matches[2] === 'plss' &&
					matches[3].includes(run)
				) {
					console.log('[#] Kori brbing, grambling...');
					return true;
					// chrome.storage.local.set({ gramble: true });
					// chrome.runtime.sendMessage({ action: 'gramble' }, (res) => {
					// 	if (chrome.runtime.lastError) {
					// 		console.error(
					// 			'Error sending message from websocket handler to worker:',
					// 			chrome.runtime.lastError
					// 		);
					// 		return;
					// 	}
					// });
				}
			}
		}

		return false;
	}

	private jitter(): number {
		// keepalive timeout seconds in welcome message - we use 60 seconds & 0 <= 30 secs random
		// jitter for debugging
		const timer = 60000; // ms
		const randJitter = Math.floor(Math.random() * 30000);
		const mins = new Date(Date.now() + (timer + randJitter));

		console.log(
			`[*]<${new Date(Date.now()).toLocaleTimeString()} Next PING in ${mins.toLocaleTimeString()}`
		);
		return timer + randJitter;
	}

	// keepalive(): void {}
}

enum SockState {
	Connecting = 0,
	Open = 1,
	Closing = 2,
	Closed = 3,
}

// poll the socket every 5ms (blocking ws sender execution) until OPEN readyState is found
async function waitOnSock(sock: WebSocket | null, state: SockState = 1) {
	setTimeout(function () {
		if (sock && sock.readyState === state) {
			console.log(
				'[+] Socket connection changed:',
				sock ? sock.readyState : sock
			);

			return;
		} else {
			console.log('...');
			waitOnSock(sock);
		}
	}, 5); // ms
}

export default WebSocketUtil;
