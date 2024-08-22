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
					reject('idk what went wrong here but its not happening lmao');
					return;
				}

				waitOnSock(this.sock).then((_) => {
					if (this.auth && this.ready()) {
						for (const msg of this.auth) {
							this.sock?.send(msg);
						}
						console.info('[->] Sent Twitch IRC auth frames.');

						/* loop socket keepalive */
						const ping = () => {
							if (this.sock !== null) {
								setTimeout(() => {
									this.sock?.send('PING');
									console.log(
										`[->]<${new Date(Date.now()).toLocaleTimeString()}> Client PING frame sent.`
									);
									
									ping(); // actually run our console.log() prior to resetting loop 
								}, this.jitter());
							} else {
								return;
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
					// we want gramble NOW, resolve the promise and handle in worker
					resolve('gramble :)');
					return true;
				}
			};

			this.sock.onclose = () => {
				console.log('[-] Closing socket connection.');
				return;
			};
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
			`[->]<${new Date(Date.now()).toLocaleTimeString()}> Responding to incoming PING frame`
		);
		this.sock?.send('PONG');
	}

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
			`JOIN #${channel}`,
        ];

		return template;
	}

	private ircParser(msg: string, channel: string, run: string): boolean {
		// console.log('[<-] incoming raw data:', msg);
		if (msg.trim() === 'PING :tmi.twitch.tv') {
			this.pong();
		}

		if (msg.includes('PRIVMSG')) {
			const re =
				/^.*?:(\w+!\w+@\w+)\.tmi\.twitch\.tv\sPRIVMSG\s#(\w+)\s:(.*$)/gm;
			const matches = re.exec(msg);

			if (matches) {
				console.log(matches);
				const broadcaster = `${channel}!${channel}@${channel}`;
				if (
					matches[1] === broadcaster &&
					matches[2] === channel &&
					matches[3].includes(run)
				) {
					console.log('[#] Kori brbing, grambling...');
					return true;
				}
			}
		} else if (
			msg.includes('USERSTATE') &&
			!msg.includes('GLOBALUSERSTATE')
		) {
			console.log(
				'[<-] Sock recv USERSTATE ',
				'\n(https://dev.twitch.tv/docs/chat/irc/#irc-command-reference)'
			);
		} else if (msg.includes('GLOBALUSERSTATE')) {
			console.log(
				'[<-] Sock recv GLOBALUSERSTATE ',
				'\n(https://dev.twitch.tv/docs/chat/irc/#irc-command-reference)'
			);
		} else if (msg.includes('NOTICE')) {
			console.log('[<-] Sock recv NOTICE:');
			msg.trim()
				.split('\r\n')
				.forEach((line) => {
					console.log(`     > ${line}`);
				});
		} else {
			console.log('[<-] Sock recv:');
			msg.trim()
				.split('\r\n')
				.forEach((line) => {
					console.log(`     > ${line}`);
				});
		}

		return false;
	}

	private jitter(): number {
		const timer = 240000; // ms -> 4 mins
		const randJitter = Math.floor(Math.random() * 60000); // jitter up to 1 min
		const mins = new Date(Date.now() + (timer + randJitter));

		console.log(
			`[+]<${new Date(Date.now()).toLocaleTimeString()}> Next PING in ${mins.toLocaleTimeString()}`
		);
		return timer + randJitter;
	}
}

enum SockState {
	Connecting = 0,
	Open = 1,
	Closing = 2,
	Closed = 3,
}

// poll the socket every 5ms (blocking ws sender execution) until OPEN readyState (by default,
// any state if specified)
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
	}, 5);
}

export default WebSocketUtil;
