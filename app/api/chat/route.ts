import {
  streamText,
  type UIMessage,
  type ModelMessage,
  convertToModelMessages,
} from "ai";
import { google } from "@ai-sdk/google";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SYSTEM_PROMPT } from "@/lib/constants";

export const maxDuration = 60;

function parseDataUrl(url: string): { mimeType: string; base64: string } | null {
  const prefixEnd = url.indexOf(";base64,");
  if (!url.startsWith("data:") || prefixEnd === -1) return null;
  return {
    mimeType: url.slice(5, prefixEnd),
    base64: url.slice(prefixEnd + 8),
  };
}

function fixDataUrls(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((msg) => {
    if (msg.role !== "user" || typeof msg.content === "string") return msg;
    if (!Array.isArray(msg.content)) return msg;

    return {
      ...msg,
      content: msg.content.map((part) => {
        // Handle image parts with data URLs
        if (part.type === "image" && typeof part.image === "string") {
          const parsed = parseDataUrl(part.image);
          if (parsed) {
            return {
              type: "image" as const,
              image: parsed.base64,
              mimeType: parsed.mimeType,
            };
          }
        }
        // Handle file parts with data URLs
        if (part.type === "file" && typeof part.data === "string") {
          const parsed = parseDataUrl(part.data);
          if (parsed) {
            return {
              type: "file" as const,
              data: parsed.base64,
              mediaType: parsed.mimeType,
            };
          }
        }
        return part;
      }),
    };
  }) as ModelMessage[];
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const modelMessages = await convertToModelMessages(messages);
  const fixedMessages = fixDataUrls(modelMessages);

  const result = streamText({
    model: google("gemini-3.1-pro-preview"),
    system: SYSTEM_PROMPT,
    messages: fixedMessages,
  });

  return result.toUIMessageStreamResponse();
}
