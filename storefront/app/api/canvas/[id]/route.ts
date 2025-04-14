import { Canvas } from "@/types";
import { Redis } from "@upstash/redis";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
// Initialize Redis
const redis = Redis.fromEnv();

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const canvasId = (await params).id;

  if (!canvasId) {
    return new NextResponse("No canvas ID found", { status: 400 });
  }

  const canvas = {
    ...((await redis.get(canvasId)) as Canvas),
    id: canvasId,
  };

  return new NextResponse(JSON.stringify({ canvas }), { status: 200 });
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const canvasId = (await params).id;

  if (!canvasId) {
    return new NextResponse("No canvas ID found", { status: 400 });
  }

  const canvas = ((await redis.get(canvasId)) || {}) as Canvas;

  console.log("vic logs canvas", canvas);

  const { input } = await req.json();

  const newCanvas = {
    ...canvas,
    ...Object.keys(input).reduce((acc, key) => {
      if (
        Array.isArray(canvas[key as keyof Canvas]) &&
        Array.isArray(input[key as keyof Canvas])
      ) {
        // Type safe array merging by explicitly casting arrays
        const existingArray = canvas[key as keyof Canvas] as unknown as any[];
        const inputArray = input[key as keyof Canvas] as unknown as any[];
        acc[key as keyof Canvas] = [...existingArray, ...inputArray] as any;
      } else {
        acc[key as keyof Canvas] = input[key as keyof Canvas];
      }
      return acc;
    }, {} as Partial<Canvas>),
    lastUpdated: Date.now(), // Add a timestamp for tracking changes
  };

  console.log("vic logs newCanvas", newCanvas);

  const result = await redis.set(canvasId, newCanvas);

  // Update lastUpdated timestamp to ensure changes are picked up
  await redis.set(`${canvasId}:lastUpdated`, Date.now());

  revalidateTag(`canvas-${canvasId}`);

  // Return the result in the response
  return new NextResponse(JSON.stringify({ result }), { status: 200 });
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const canvasId = (await params).id;

  if (!canvasId) {
    return new NextResponse("No canvas ID found", { status: 400 });
  }

  await redis.del(canvasId);

  return new NextResponse(null, { status: 201 });
};
