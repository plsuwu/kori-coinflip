import { SockAuthData } from '../../worker';

// websocket connection handler
class WebSocketUtil {
    private sock: WebSocket | null = null;
    private url: string;
    private auth?: string[];

    constructor(url: string) {
        this.url = url;
    }

    connect(auth: SockAuthData): Promise<void> {
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
                    if (this.auth) {
                        for (const message of this.auth) {
                            console.log('[*]:', message);
                            this.sock?.send(message);
                        }
                    }
                });

                resolve();
            };

            this.sock.onerror = (err) => {
                console.error('[!] Socket error:', err);
                reject('[-] err');
            };

            this.sock.onmessage = (event) => {
                this.msgHandler(event.data);
            };

            this.sock.onclose = () => {
                console.log('[-] Closing socket connection.');
                this.sock = null;
            };
        });
    }

    disconnect(): void {
        if (this.sock) {
            this.sock.close();
        }
    }

    // needs to be changed to accomodate the eventsub but for testing this is fine
    private templatedAuth(login: string, auth: string, channel: string): string[] {
        const template = [
            'CAP REQ :twitch.tv/tags twitch.tv/commands',
            `PASS oauth:${auth}`,
            `NICK ${login}`,
            `USER ${login} 8 * :${login}`,
            `JOIN #${channel}`,
        ];

        return template;
    }

    private msgHandler(msg: string): void {
        // parse kori !brb
        // parse ping -> pong
        console.log('[+] Incoming data: ', msg);
        // if (msg
	}
}

// poll the socket state until we get the OPEN readystate, then return
async function waitOnSock(sock: WebSocket) {
    setTimeout(function() {
        if (sock.readyState === 1) {
            console.log('[+] Socket connection OPEN');
            return;
        } else {
            console.log('...');
            waitOnSock(sock);
        }
    }, 5); // ms
}

export default WebSocketUtil;
