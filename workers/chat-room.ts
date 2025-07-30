export interface WebSocketConnection {
  webSocket: WebSocket;
  userId: string;
  nickname: string;
  roomId: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  timestamp: number;
  type: 'message' | 'join' | 'leave';
}

export interface RoomState {
  id: string;
  name: string;
  createdAt: number;
  userCount: number;
  messages: ChatMessage[];
}

export class ChatRoom {
  private state: DurableObjectState;
  private connections: Map<string, WebSocketConnection> = new Map();
  private roomState: RoomState;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.roomState = {
      id: '',
      name: '',
      createdAt: Date.now(),
      userCount: 0,
      messages: []
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const roomId = url.pathname.split('/').pop() || '';
    
    // Initialize room state if not already done
    if (!this.roomState.id) {
      this.roomState.id = roomId;
      this.roomState.name = url.searchParams.get('name') || `Room ${roomId}`;
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    const userId = url.searchParams.get('userId') || crypto.randomUUID();
    const nickname = url.searchParams.get('nickname') || 'Anonymous';

    const connection: WebSocketConnection = {
      webSocket: server,
      userId,
      nickname,
      roomId
    };

    server.accept();
    this.connections.set(userId, connection);
    this.roomState.userCount = this.connections.size;

    // Send room state to new user
    this.sendToUser(userId, {
      type: 'room-state',
      data: {
        ...this.roomState,
        messages: this.roomState.messages.slice(-50) // Only send last 50 messages
      }
    });

    // Notify others of new user
    const joinMessage: ChatMessage = {
      id: crypto.randomUUID(),
      userId,
      nickname,
      content: `${nickname} joined the room`,
      timestamp: Date.now(),
      type: 'join'
    };

    this.addMessage(joinMessage);
    this.broadcastToOthers(userId, {
      type: 'message',
      data: joinMessage
    });

    this.broadcastToOthers(userId, {
      type: 'user-count',
      data: { count: this.connections.size }
    });

    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleMessage(userId, data);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    server.addEventListener('close', () => {
      this.connections.delete(userId);
      this.roomState.userCount = this.connections.size;

      const leaveMessage: ChatMessage = {
        id: crypto.randomUUID(),
        userId,
        nickname,
        content: `${nickname} left the room`,
        timestamp: Date.now(),
        type: 'leave'
      };

      this.addMessage(leaveMessage);
      this.broadcast({
        type: 'message',
        data: leaveMessage
      });

      this.broadcast({
        type: 'user-count',
        data: { count: this.connections.size }
      });
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleMessage(userId: string, data: any) {
    const connection = this.connections.get(userId);
    if (!connection) return;

    switch (data.type) {
      case 'send-message':
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          userId,
          nickname: connection.nickname,
          content: data.content,
          timestamp: Date.now(),
          type: 'message'
        };

        this.addMessage(message);
        this.broadcast({
          type: 'message',
          data: message
        });
        break;

      case 'ping':
        this.sendToUser(userId, { type: 'pong' });
        break;
    }
  }

  private addMessage(message: ChatMessage) {
    this.roomState.messages.push(message);
    // Keep only last 1000 messages
    if (this.roomState.messages.length > 1000) {
      this.roomState.messages = this.roomState.messages.slice(-1000);
    }
  }

  private sendToUser(userId: string, message: any) {
    const connection = this.connections.get(userId);
    if (connection && connection.webSocket.readyState === 1) {
      connection.webSocket.send(JSON.stringify(message));
    }
  }

  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.connections.forEach((connection) => {
      if (connection.webSocket.readyState === 1) {
        connection.webSocket.send(messageStr);
      }
    });
  }

  private broadcastToOthers(excludeUserId: string, message: any) {
    const messageStr = JSON.stringify(message);
    this.connections.forEach((connection, userId) => {
      if (userId !== excludeUserId && connection.webSocket.readyState === 1) {
        connection.webSocket.send(messageStr);
      }
    });
  }
}