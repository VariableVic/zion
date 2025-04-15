import { Agent } from "../../../lib/agent/core/agent";
import path from "path";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const agent = new Agent();

export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get("prompt");

  if (!prompt) {
    return NextResponse.json({ Message: "No prompt provided", status: 400 });
  }

  const image = await agent.generateImage(prompt);
  const buffer = Buffer.from(image.base64, "base64");

  try {
    await writeFile(
      path.join(process.cwd(), `image-output/image-${Date.now()}.png`),
      buffer
    );
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    console.error("Error occured ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
}
