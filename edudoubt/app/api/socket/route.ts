// Socket.io is handled via a custom server in production
// For Next.js App Router, use a separate socket server or pages/api/socket.ts
export async function GET() {
  return new Response('Socket.io endpoint - use custom server', { status: 200 });
}
