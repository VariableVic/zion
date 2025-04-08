import type { Message } from "ai";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const removeUiTags = (content: string) => {
    return content.replace(/\[[^\]]+\]/g, "").trim();
  };

  return (
    <div className="prose prose-sm space-y-2 dark:prose-invert break-words [&_ol]:!my-1 [&_ul]:!my-1">
      <ReactMarkdown>{removeUiTags(message.content)}</ReactMarkdown>
    </div>
  );
}
