// src/socket.ts
import { io } from 'socket.io-client';

const URL = 'http://localhost:3000';
export const socket = io(URL, {
  autoConnect: false, // We will connect manually when the user is logged in
});
