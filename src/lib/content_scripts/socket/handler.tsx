// import { nickname, oauth } from "../../worker";
// import type { UserInfo } from '../../worker';
// import WebSocketUtil from "./websocket";

// CAP REQ :twitch.tv/tags twitch.tv/commands
// PASS oauth:{auth}
// NICK {nick}
// USER {nick} 8 * :{nick}
// JOIN #{join}
//



/*
* ws.connect('wss://example.ws/server');
* ws.send('string data');
* ws.disconnect();
*
* if (ws.listening()) {
*   console.log('ws is connected.');
* }
*/







/*

const parseSockMsg = (data: string, socket: WebSocket | null) => {
	// console.log('[+] reading incoming data:', data);
    if (!(oauth() || nickname())) {
        console.error('[-] No login info stored; unable to connect to socket.');
    }
    console.info('[debug] RAW INCOMING DATA FROM SOCKET: ', data);

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

export const openWebsocket = (info: AuthInfo) => {
	if (socket) {
		console.log('[-] A socket connection is already open.');
		return;
	}

    console.log('passed user info:', info);

    const templ = [
    	`CAP REQ :twitch.tv/tags twitch.tv/commands`,
    	`PASS oauth:${info.token}`,
    	`NICK ${info.user_info.login}`,
    	`USER ${info.user_info.login} * :${info.user_info.login}`,
    	`JOIN #${JOIN}`,
    ];


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
        chrome.storage.local.set({ enabled: false });
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

*/
