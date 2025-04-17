import { Agent } from "../../../lib/agent/core/agent";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = new Agent();

  const result = await agent.handleStreamingMessage(messages);

  return result;
}
