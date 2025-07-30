'use client'

import { useState, useEffect, useRef } from 'react';

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  timestamp: number;
  type: 'message' | 'join' | 'leave';
}

interface ChatRoomProps {
  roomId: string;
  nickname: string;
  onLeaveRoom: () => void;
}

export default function ChatRoom({ roomId, nickname, onLeaveRoom }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId] = useState(() => crypto.randomUUID());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    connectToRoom();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, nickname]);

  const connectToRoom = () => {
    setIsConnecting(true);
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}/api/ws/room/${roomId}?userId=${userId}&nickname=${encodeURIComponent(nickname)}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      console.log('Connected to chat room');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      console.log('Disconnected from chat room');
      
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current === ws) {
          connectToRoom();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'room-state':
        setMessages(data.data.messages || []);
        setUserCount(data.data.userCount || 0);
        break;
      
      case 'message':
        setMessages(prev => [...prev, data.data]);
        break;
      
      case 'user-count':
        setUserCount(data.data.count);
        break;
      
      case 'pong':
        // Handle ping/pong if needed
        break;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'send-message',
      content: newMessage.trim()
    }));

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case 'join':
        return 'text-green-600 dark:text-green-400 italic text-sm';
      case 'leave':
        return 'text-red-600 dark:text-red-400 italic text-sm';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              房间: {roomId}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>昵称: {nickname}</span>
              <span>在线用户: {userCount}</span>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
                <span>
                  {isConnected ? '已连接' : isConnecting ? '连接中...' : '已断开'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            离开房间
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              {message.type === 'message' ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800 dark:text-white">
                      {message.nickname}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <span className={getMessageStyle(message)}>
                    {message.content} - {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (按Enter发送)"
            disabled={!isConnected}
            rows={2}
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-md transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}