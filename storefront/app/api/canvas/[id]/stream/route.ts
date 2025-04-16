import { Canvas } from "@/types";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Initialize Redis client
const redis = Redis.fromEnv();

// Headers for SSE
const headers = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const canvasId = (await params).id;

  if (!canvasId) {
    return new NextResponse("No canvas ID found", { status: 400 });
  }

  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const canvas = (await redis.get(canvasId)) as Canvas;
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ canvas })}\n\n`)
      );

      // Create unique client ID for this connection
      const clientId = `client-${canvasId}-${Date.now()}`;

      // Key for tracking active SSE connections
      const activeClientsKey = `canvas:${canvasId}:active-clients`;

      // Add this client to active clients set
      await redis.sadd(activeClientsKey, clientId);

      // Set up polling for this client - we'll use the lastUpdated timestamp approach
      let lastUpdateTime = canvas?.lastUpdated || Date.now();

      const checkForUpdates = async () => {
        try {
          // Get the latest canvas
          const updatedCanvas = (await redis.get(canvasId)) as Canvas;

          // Only send updates if there are changes
          if (
            updatedCanvas?.lastUpdated &&
            updatedCanvas.lastUpdated > lastUpdateTime
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ canvas: updatedCanvas })}\n\n`
              )
            );
            lastUpdateTime = updatedCanvas.lastUpdated;
          }

          // If connection is still open, schedule the next check
          if (!req.signal.aborted) {
            setTimeout(checkForUpdates, 1000);
          } else {
            // Remove client from active clients on disconnect
            await redis.srem(activeClientsKey, clientId);
          }
        } catch (error) {
          console.error("Error checking for canvas updates:", error);
          if (!req.signal.aborted) {
            setTimeout(checkForUpdates, 5000); // Retry with backoff
          } else {
            // Remove client from active clients on disconnect with error
            await redis.srem(activeClientsKey, clientId);
          }
        }
      };

      // Start checking for updates
      checkForUpdates();

      // Handle connection close
      req.signal.addEventListener("abort", async () => {
        // Remove client from active clients on disconnect
        await redis.srem(activeClientsKey, clientId);
        try {
          controller.close();
        } catch (error) {
          console.warn(
            "Controller was already closed, proceeding with cleanup"
          );
        }
      });
    },
  });

  return new NextResponse(stream, { headers });
}
