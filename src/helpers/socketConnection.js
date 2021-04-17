import socketClient from "socket.io-client";
import { PROD_LINK } from "dotenv";

const connectSocket = (token) => {
  const socket = socketClient.connect("http://192.168.43.96:5000", {
    query: `token=${token}`,
  });
  return socket;
};

export default connectSocket;
