"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/types";

interface CanvasRealtimeProps {
  canvasId: string;
  onUpdate?: (canvas: Canvas) => void;
}

export default function CanvasRealtime({
  canvasId,
  onUpdate,
}: CanvasRealtimeProps) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">(
    "connecting"
  );

  useEffect(() => {
    if (!canvasId) return;

    // Create an EventSource connection to the SSE endpoint
    const eventSource = new EventSource(`/api/canvas/${canvasId}/stream`);

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newCanvas = data.canvas;
        setCanvas(newCanvas);
        setStatus("connected");

        // Call the onUpdate callback if provided
        if (onUpdate) {
          onUpdate(newCanvas);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    // Handle connection open
    eventSource.onopen = () => {
      setStatus("connected");
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setStatus("error");

      // Attempt to reconnect after a delay
      setTimeout(() => {
        eventSource.close();
        setStatus("connecting");
        // The browser will automatically attempt to reconnect
      }, 5000);
    };

    // Clean up the connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, [canvasId, onUpdate]);

  // Simple status display
  return (
    <div className="canvas-realtime">
      {!canvas ? (
        <div className="loading">
          {status === "connecting"
            ? "Connecting to canvas..."
            : status === "error"
            ? "Connection error, retrying..."
            : "Loading canvas data..."}
        </div>
      ) : (
        <div className="canvas-data">
          <div className="status-indicator" data-status={status}>
            {status === "connected" ? "Live" : status}
          </div>
          <div className="last-updated">
            Last updated:{" "}
            {canvas.lastUpdated
              ? new Date(canvas.lastUpdated).toLocaleTimeString()
              : "Never"}
          </div>
          <div className="recommendations">
            {canvas.product_recommendations?.map((rec, i) => (
              <div key={i} className="recommendation">
                <h3>{rec.heading}</h3>
                <div className="products-grid">
                  {rec.products.map((product, j) => (
                    <div key={j} className="product-card">
                      {product.title || product.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
