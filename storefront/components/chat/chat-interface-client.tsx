"use client";

import { CategoryBar } from "@/components/chat/category-bar";
import { ChatMessage } from "@/components/chat/chat-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { HttpTypes } from "@medusajs/types";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Bot, Send, Square, User } from "lucide-react";

export function ChatInterfaceClient({
  categories,
  cart,
}: {
  categories: HttpTypes.StoreProductCategory[];
  cart?: HttpTypes.StoreCart | null;
}) {
  const {
    append,
    handleInputChange,
    handleSubmit,
    input,
    messages,
    setMessages,
    status,
    stop,
  } = useChat({
    api: "/api/chat",
  });

  const handleOptionClick = (option: string) => {
    append({ role: "user", content: option });
  };

  const suggestions = [
    "I'm looking to furnish my new living room",
    "Show me mid-century modern furniture",
    "What are your best sellers?",
    cart?.items?.length ? "What would you recommend based on my cart?" : null,
  ].filter((suggestion) => suggestion !== null);

  const isLoading = status === "submitted" || status === "streaming";

  const { scrollViewportRef, showScrollButton, scrollToBottom, handleScroll } =
    useScrollToBottom({
      messages,
      threshold: 100,
      messagesContainerSelector: ".chat-messages-container",
    });

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <Card className="overflow-hidden w-1/2">
      <CategoryBar
        categories={categories}
        handleOptionClick={handleOptionClick}
        resetChat={resetChat}
        isLoading={isLoading}
      />
      <div className="flex h-full flex-col">
        <ScrollArea className="flex-1 h-[calc(100vh-15rem)]">
          <ScrollAreaPrimitive.Viewport
            ref={scrollViewportRef}
            className="w-full scroll-smooth h-[calc(100vh-15rem)]"
            onScroll={handleScroll}
          >
            <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 chat-messages-container">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
                  <div className="rounded-full bg-primary/10 p-4 relative after:absolute after:inset-0 after:rounded-full after:animate-pulse after:bg-primary/20 after:blur-md after:-z-10 before:absolute before:inset-0 before:rounded-full before:animate-[ping_3s_ease-in-out_infinite] before:bg-primary/10 before:blur-sm before:-z-10">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    Welcome to Zion: The Generative Storefront
                  </h2>
                  <p className="max-w-md text-muted-foreground">
                    Ask me to recommend products, find items that match your
                    needs, or help you check out.
                  </p>
                  <p className="max-w-md text-muted-foreground">
                    I'm currently connected to a{" "}
                    <strong>vintage furniture store</strong>.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleOptionClick(suggestion)}
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
                      message.role === "user" ? "justify-end" : "justify-start"
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
            className="absolute bottom-32 right-1/2 mr-8 z-10 rounded-full shadow-lg"
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
            {isLoading ? (
              <Button
                type="submit"
                size="icon"
                className="rounded-full"
                onClick={stop}
              >
                <Square className="h-4 w-4" />
                <span className="sr-only">Stop</span>
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="rounded-full"
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            )}
          </form>
        </div>
      </div>
    </Card>
  );
}
