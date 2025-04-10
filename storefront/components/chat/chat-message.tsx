import type { Message } from "ai";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const removeUiTags = (content: string) => {
    return content
      .replace(/\[[^\]]+\]/g, "")
      .replace(/!\((.*?)\)/g, "")
      .trim();
  };

  return (
    <div className="prose-invert prose-sm space-y-2 break-words [&_ol]:!my-1 [&_ul]:!my-1">
      {message.content.length > 0 ? (
        <ReactMarkdown>{removeUiTags(message.content)}</ReactMarkdown>
      ) : (
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-75"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-150"></div>
        </div>
      )}
    </div>
  );
}
