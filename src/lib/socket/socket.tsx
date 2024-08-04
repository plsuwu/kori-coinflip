import { NICK, PASS, JOIN } from "./debug";

// CAP REQ :twitch.tv/tags twitch.tv/commands
// PASS oauth:{auth}
// NICK {nick}
// USER {nick} 8 * :{nick}
// JOIN #{join}

let socket: WebSocket | null = null;
const templ = [
	`CAP REQ :twitch.tv/tags twitch.tv/commands`,
	`PASS oauth:${PASS}`,
	`NICK ${NICK}`,
	`USER ${NICK} 8 * :${NICK}`,
	`JOIN #${JOIN}`,
];

const KEEPALIVE_PING = 'PING :tmi.twitch.tv';

// maybe dont hardcode this but ultimately who care
const BE_RIGHT_BACK = ':kori!kori@kori.tmi.twitch.tv PRIVMSG #kori :!brb';

const parseSockMsg = (data: string, socket: WebSocket | null) => {
	// console.log('[+] reading incoming data:', data);
	if (socket) {
		if (data.includes(KEEPALIVE_PING)) {
			console.log('[+] Responding to PING');
			socket.send('PONG');
		} else if (
			data.includes(BE_RIGHT_BACK)
		) {
			console.log('[+] Kori will be right back, all-in on a random side of the coin');
            // logic ...
		}
	} else {
		console.error('[-] Websocket object is null.');
	}
};

export const openWebsocket = () => {
	if (socket) {
		console.log('[-] A socket connection is already open.');
		return;
	}

	socket = new WebSocket('wss://irc-ws.chat.twitch.tv');
	socket.onopen = () => {
		console.log('[+] >> Websocket conn. opened.\n');
		templ.forEach((msg) => {
			console.log(`[+] Submitting identifiers for init routine: ${msg}`);
			if (socket) {
				socket.send(msg);
			} else {
				console.error('[-] No connection in socket.');
			}
		});
	};

	socket.onmessage = (event) => {
		parseSockMsg(event.data, socket);
	};

	socket.onclose = () => {
		console.log('[-] >> Websocket conn. closed.\n');
		socket = null;
	};

	socket.onerror = (err) => {
		console.error('[-] >> Websocket error =>', err);
	};
};

export const closeWebsocket = () => {
	if (socket) {
		socket.close();
		socket = null;
		console.log(' [+] >> Websocket conn. closed.\n');
	} else {
		console.log('[-] Websocket is null, nothing to close.');
	}
};
