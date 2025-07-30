// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as handler } from "../.open-next/worker.js";
import { ChatRoom } from "./chat-room";

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle WebSocket connections for chat rooms
    if (url.pathname.startsWith('/api/ws/room/')) {
      const roomId = url.pathname.split('/').pop();
      if (!roomId) {
        return new Response('Room ID required', { status: 400 });
      }

      // Get Durable Object for this room
      const id = env.CHATROOM.idFromName(roomId);
      const room = env.CHATROOM.get(id);
      
      return room.fetch(request);
    }

    // Handle all other requests with Next.js
    return handler.fetch(request, env, ctx);
  },

  async scheduled(controller: ScheduledController, env: any, ctx: any) {
    console.log(`Hello from Cron! Triggered by: ${controller.cron}`);
  },
} satisfies ExportedHandler;

// Export the ChatRoom Durable Object
export { ChatRoom };

// The re-export is only required if your app uses the DO Queue and DO Tag Cache
// See https://opennext.js.org/cloudflare/caching for details
// @ts-ignore `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "../.open-next/worker.js"; 