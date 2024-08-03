import { NICK, PASS, JOIN } from './socket/debug';
import { openWebsocket, closeWebsocket } from './socket/socket';

chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.get(['enabled'], (res) => {
		if (res.enabled === undefined) {
			chrome.storage.local.set({ enabled: false });
		} else if (res.enabled) {
			openWebsocket();
		}
	});
});

chrome.storage.onChanged.addListener((changes, loc) => {
	if (loc === 'local' && changes.enabled) {
		if (changes.enabled.newValue) {
			console.log('[+] Ext. enabled, activate worker tasks:');
			openWebsocket();
		} else {
			console.log('[-] Ext. disabled, kill worker tasks:');
			closeWebsocket();
		}
	}
});

// chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
// 	if (msg.type === 'STATE_UPDATED') {
// 		if (msg.enabled) {
// 			openWebsocket();
// 		} else {
// 			closeWebsocket();
// 		}
// 	}
// });
