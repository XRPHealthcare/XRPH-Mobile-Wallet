import {io} from 'socket.io-client';

export const socketURL = 'YOUR_SOCKET_URL';

export const socket = io(socketURL);
