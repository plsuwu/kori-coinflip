class WebSocketUtil {
	private static instance: WebSocketUtil;
	private socket: WebSocket | null = null;
	private url: string = '';

	private constructor() {}

	public static initial(): WebSocketUtil {
		if (!WebSocketUtil.instance) {
			WebSocketUtil.instance = new WebSocketUtil();
		}

		return WebSocketUtil.instance;
	}

	public connect(url: string): void {
		if (this.socket) {
			console.warn('[!] Websocket is already connected.');
			return;
		}

		this.url = url;
		this.socket = new WebSocket(url);

		// init connection
		this.socket.onopen = () => {
			console.log(`[+] Handshake to ${url} successful.`);
		};

		// recv message from socket server
		this.socket.onmessage = (event) => {
			console.log(`[debug] Incoming message: ${event.data}`);
			// message handler logic to parse kori !brb
		};

        // recv close message
		this.socket.onclose = () => {
			console.log(`[-] Closing socket connection...`);
			this.socket = null;
		};

		this.socket.onerror = (err) => {
			console.error('[!] Disconnecting due to websocket error:', err);
            this.disconnect();
		};
	}

	public disconnect(): void {
        if (this.socket) {
            this.socket.close();
        } else {
            console.warn('[!] No websocket connection to close');
        }
    }

    public send(message: string): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('[!] No open websocket connection. Unable to send message.');
        }
    }

    public checkConnection(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }
}

export default WebSocketUtil;
