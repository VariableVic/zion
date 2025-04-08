import { Agent } from "../../../lib/agent/core/agent";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const agent = new Agent();

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await agent.handleStreamingMessage(messages);

  return result;
}
