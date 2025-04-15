"use server";

import { revalidateTag } from "next/cache";
import {
  getCacheOptions,
  getCacheTag,
  getCanvasId,
  removeCanvasId,
} from "./cookies";
import medusaError from "../util/medusa-error";
import { Canvas } from "@/types";

const baseUrl = "http://localhost:3000";

export async function addToCanvas(input: Partial<Canvas>) {
  const canvasId = await getCanvasId();

  if (!canvasId) {
    return;
  }

  const canvasCacheTag = await getCacheTag("canvas");

  const response = await fetch(`${baseUrl}/api/canvas/${canvasId}`, {
    method: "POST",
    body: JSON.stringify({
      input,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then(() => {
      revalidateTag(canvasCacheTag);
    })
    .catch((err) => medusaError(err));

  return response;
}

export async function retrieveCanvas() {
  const canvasId = await getCanvasId();

  if (!canvasId) {
    return;
  }

  const next = {
    ...(await getCacheOptions("canvas")),
  };

  const response = await fetch(`${baseUrl}/api/canvas/${canvasId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next,
    cache: "force-cache",
  })
    .then((res) => res.json())
    .catch((err) => medusaError(err));

  return response;
}

export async function deleteCanvas() {
  const canvasCacheTag = await getCacheTag("canvas");

  const canvasId = await getCanvasId();

  if (!canvasId) {
    return;
  }

  await fetch(`${baseUrl}/api/canvas/${canvasId}`, {
    method: "DELETE",
  }).catch((err) => medusaError(err));

  await removeCanvasId();

  revalidateTag(canvasCacheTag);

  return "Canvas deleted";
}
