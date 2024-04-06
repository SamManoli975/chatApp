import React, { useState, useEffect, ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

function App(): JSX.Element {
  const [room, setRoom] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageReceived, setMessageReceived] = useState<string>("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  useEffect(() => {
    socket.on("receive_message", (data: { message: string }) => {
      setMessageReceived(data.message);
    });

    return () => {
      socket.disconnect(); // Clean up socket on component unmount
    };
  }, []);

  return (
    <div className="App">
      <input
        placeholder="Room Number..."
        value={room}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setRoom(event.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      <input
        placeholder="Message..."
        value={message}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setMessage(event.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <h1>Received Message:</h1>
      <p>{messageReceived}</p>
    </div>
  );
}

export default App;
