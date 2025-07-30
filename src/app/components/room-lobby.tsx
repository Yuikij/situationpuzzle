'use client'

import { useState } from 'react';

interface RoomLobbyProps {
  onJoinRoom: (roomId: string, nickname: string) => void;
}

export default function RoomLobby({ onJoinRoom }: RoomLobbyProps) {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      alert('请输入昵称');
      return;
    }

    setIsCreatingRoom(true);
    const newRoomId = generateRoomId();
    onJoinRoom(newRoomId, nickname.trim());
  };

  const handleJoinRoom = () => {
    if (!nickname.trim()) {
      alert('请输入昵称');
      return;
    }

    if (!roomId.trim()) {
      alert('请输入房间ID');
      return;
    }

    onJoinRoom(roomId.trim(), nickname.trim());
  };

  const generateRoomId = () => {
    // Generate a random 6-character room ID
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'create' | 'join') => {
    if (e.key === 'Enter') {
      if (action === 'create') {
        handleCreateRoom();
      } else {
        handleJoinRoom();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              聊天室
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              创建或加入聊天房间开始对话
            </p>
          </div>

          {/* Nickname Input */}
          <div className="mb-6">
            <label 
              htmlFor="nickname" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              昵称 *
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'create')}
              placeholder="请输入您的昵称"
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Create Room Section */}
          <div className="mb-6">
            <button
              onClick={handleCreateRoom}
              disabled={!nickname.trim() || isCreatingRoom}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
            >
              {isCreatingRoom ? '创建中...' : '创建新房间'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                或者
              </span>
            </div>
          </div>

          {/* Join Room Section */}
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="roomId" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                房间ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyPress={(e) => handleKeyPress(e, 'join')}
                placeholder="请输入房间ID"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleJoinRoom}
              disabled={!nickname.trim() || !roomId.trim()}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
            >
              加入房间
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
              使用说明：
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 输入昵称后可以创建新房间或加入现有房间</li>
              <li>• 房间ID是6位字符，区分大小写</li>
              <li>• 多人可以同时在同一个房间聊天</li>
              <li>• 支持实时消息传递</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}