'use client'

import { useState } from "react";
import RoomLobby from "./components/room-lobby";
import ChatRoom from "./components/chat-room";

type AppState = 'lobby' | 'chat';

export default function Page() {
  const [appState, setAppState] = useState<AppState>('lobby');
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [currentNickname, setCurrentNickname] = useState<string>('');

  const handleJoinRoom = (roomId: string, nickname: string) => {
    setCurrentRoom(roomId);
    setCurrentNickname(nickname);
    setAppState('chat');
  };

  const handleLeaveRoom = () => {
    setCurrentRoom('');
    setCurrentNickname('');
    setAppState('lobby');
  };

  if (appState === 'chat') {
    return (
      <ChatRoom 
        roomId={currentRoom}
        nickname={currentNickname}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <RoomLobby onJoinRoom={handleJoinRoom} />
  );
}
