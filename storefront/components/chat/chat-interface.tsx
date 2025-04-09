"use client";

import { ChatMessage } from "@/components/chat/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Bot, Send, User } from "lucide-react";
import { useEffect } from "react";
import { Card } from "../ui/card";
import { AiCanvas } from "./ai-canvas";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";

  const { scrollViewportRef, showScrollButton, scrollToBottom, handleScroll } =
    useScrollToBottom({
      messages,
      threshold: 700,
      messagesContainerSelector: ".chat-messages-container",
    });

  const toolResults = messages
    .map(
      (message) =>
        message.parts?.find((part) => part.type === "tool-invocation")
          ?.toolInvocation
    )
    .filter(
      (toolInvocation) =>
        toolInvocation !== undefined && toolInvocation.state === "result"
    );

  const followUpOptions = toolResults
    .filter(
      (toolInvocation) => toolInvocation.toolName === "giveUserFollowUpOptions"
    )
    ?.map((toolInvocation) => toolInvocation.result);

  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  return (
    <div className="flex flex-row overflow-hidden w-full p-4 space-x-4">
      <Card className="overflow-hidden w-1/2">
        <div className="flex h-full flex-col">
          <ScrollArea className="flex-1 h-[calc(100vh-9rem)]">
            <ScrollAreaPrimitive.Viewport
              ref={scrollViewportRef}
              className="h-full w-full"
              style={{ height: "calc(100vh - 12rem)" }}
              onScroll={handleScroll}
            >
              <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 chat-messages-container">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      AI Shopping Assistant
                    </h2>
                    <p className="max-w-md text-muted-foreground">
                      Ask me to recommend products, find items that match your
                      needs, or help you check out.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {[
                        "I'm looking for clothes to keep me warm and cosy",
                        "I'm looking for a new pair of shorts",
                        "What are your best sellers?",
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            handleInputChange({
                              target: { value: suggestion },
                            } as any);
                            handleSubmit({ preventDefault: () => {} } as any);
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex w-full items-start gap-4",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      {message.role !== "user" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <ChatMessage message={message} />
                        {followUpOptions && (
                          <div className="flex flex-wrap justify-center gap-2">
                            {followUpOptions.map((option) => (
                              <Button
                                key={option.label}
                                variant="outline"
                                className="rounded-full"
                                onClick={() => {
                                  handleInputChange({
                                    target: { value: option.value },
                                  } as any);
                                  handleSubmit({
                                    preventDefault: () => {},
                                  } as any);
                                }}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollAreaPrimitive.Viewport>
          </ScrollArea>

          {showScrollButton && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-20 right-4 z-10 rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          )}

          <div className="border-t bg-background p-4 sticky bottom-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                placeholder="Ask about products or for shopping assistance..."
                value={input}
                onChange={handleInputChange}
                className="flex-1 rounded-full bg-muted"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full"
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </Card>
      <AiCanvas toolResults={toolResults} />
    </div>
  );
}
