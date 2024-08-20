import { gramble as g, SockAuthData } from '../../worker';

// websocket connection handler
class WebSocketUtil {
	private sock: WebSocket | null = null;
	private url: string;
	private auth?: string[];

	constructor(url: string) {
		this.url = url;
	}

	public connect(auth: SockAuthData): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.sock) {
				reject('[!] Already connected and listening.');
				return;
			}
			this.auth = this.templatedAuth(auth.user, auth.token, 'kori');
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
									console.log('[*] send keepalive here.');
									ping();
								}, this.jitter());
							}
						};

						ping();
					}

					resolve();
				});
			};

			this.sock.onerror = (err) => {
				console.error('[!] Socket error:', err);
				reject('[-] err');
			};

			this.sock.onmessage = (event) => {
				this.ircParser(event.data);
			};

			this.sock.onclose = () => {
				console.log('[-] Closing socket connection.');
				this.sock?.close();
				this.sock = null;

				return;

				// chrome.runtime.sendMessage({ action: 'sock_closed' }, (res) => {
				// 	console.log('[-] State is now disabled:', res);
				// });
			};

			// resolve();
		});
	}

	public disconnect(): void {
		console.log(this.sock);

		if (this.sock) {
			this.sock.close();
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
			`JOIN #plss`,
		];

		return template;
	}

	private ircParser(msg: string): void {
		console.log('[+] incoming raw data: ', msg);
		if (msg === 'PING :tmi.twitch.tv') {
			this.pong();
		}

		if (msg.includes('PRIVMSG')) {
			const re =
				/.*?:(\w+)!(\w+)@(\w+)\.tmi\.twitch\.tv\sPRIVMSG\s#(\w+)\s:(.*$)/gm;
			const matches = re.exec(msg);

			if (matches) {
				console.log(matches);
				if (matches[1] === 'plss' && matches[5].includes('!brb')) {
					console.log('[+] Kori brbing, grambling...');
                    chrome.storage.local.set({ gramble: true });
                    // chrome.runtime.sendMessage({ action: 'gramble' }, (res) => {
                    //     console.log(res);
                    // });
                }
			}
		}
	}

	private jitter(): number {
		// keepalive timeout seconds in welcome message - we use 60 seconds + here for debug
		const timer = 60000; // ms
		const randJitter = Math.floor(Math.random() * 30000);
		const mins = new Date(Date.now() + (timer + randJitter));

		console.log(`[*] Next PING in ${mins.toLocaleTimeString()}`);
		return timer + randJitter;
	}

	keepalive(): void {}
}

// poll the socket state until we get the OPEN readystate, then return
async function waitOnSock(sock: WebSocket) {
	setTimeout(function () {
		if (sock && sock.readyState === WebSocket.OPEN) {
			console.log('[+] Socket connection OPEN');
			return;
		} else {
			console.log('...');
			waitOnSock(sock);
		}
	}, 5); // ms
}

export default WebSocketUtil;
