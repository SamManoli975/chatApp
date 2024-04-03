import { io, Socket } from 'socket.io-client'; // Import 'io' and 'Socket' from 'socket.io-client'
import { useEffect, useState } from "react";

const socket: Socket = io("http://localhost:3002"); // Use 'io' to create a socket connection

export default function Home() {
  return (
    <main>
      <div>hi</div>
    </main>
  );
}

