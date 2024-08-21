
const TTV_CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';
const AUTH_CALLBACK_URI = 'https://kabldnfpbfcdkbhbolpdbbppiendepjj.chromiumapp.org/ttv_callback';
const RES_TYPE = 'token';
const AUTH_SCOPE = 'chat%3Aread';

// export const STREAM_LINK = 'https://www.twitch.tv/kori';
const STREAM_LINK = 'https://www.twitch.tv/tobs';
const IRC_SOCKET_URL = 'wss://irc-ws.chat.twitch.tv/';
const auth_uri = `https://id.twitch.tv/oauth2/authorize?force_verify=true&response_type=${RES_TYPE}&client_id=${TTV_CLIENT_ID}&redirect_uri=${AUTH_CALLBACK_URI}&scope=${AUTH_SCOPE}`;


export { STREAM_LINK, IRC_SOCKET_URL, auth_uri };




