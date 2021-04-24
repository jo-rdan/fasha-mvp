import socketClient from "socket.io-client";
import { PROD_LINK } from "dotenv";

const connectSocket = (token) => {
  const socket = socketClient.connect(PROD_LINK, {
    query: `token=${token}`,
  });
  return socket;
};

export default connectSocket;
