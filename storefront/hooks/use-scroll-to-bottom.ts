import { useRef, useState, useEffect } from "react";
import { Message } from "@ai-sdk/react";
interface UseScrollToBottomProps {
  messages: Message[]; // Replace 'any' with your message type if available
  threshold?: number;
  /**
   * Optional selector for the messages container to observe.
   * If not provided, will use viewport for basic scroll behavior.
   */
  messagesContainerSelector?: string;
}

export function useScrollToBottom({
  messages,
  threshold = 100,
  messagesContainerSelector,
}: UseScrollToBottomProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    scrollToBottomIfWithinThreshold();
  }, [messages]);

  const scrollToBottom = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });

    setShowScrollButton(false);
  };

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    // Only observe content changes if a specific container is specified
    if (messagesContainerSelector) {
      const container = viewport.querySelector(messagesContainerSelector);
      if (container) {
        const mutationObserver = new MutationObserver((mutations) => {
          // Check if any of the mutations are relevant to our scrolling behavior
          const hasRelevantChanges = mutations.some((mutation) => {
            // Check for new messages or content changes
            return (
              mutation.type === "childList" ||
              (mutation.type === "characterData" &&
                mutation.target.textContent?.trim().length)
            );
          });

          if (hasRelevantChanges) {
            // Use RAF to batch multiple mutations and avoid excessive calculations
            requestAnimationFrame(() => {
              scrollToBottomIfWithinThreshold();
            });
          }
        });

        mutationObserver.observe(container, {
          childList: true, // Watch for new messages
          subtree: true, // Watch for changes within messages (streaming content)
          characterData: true, // Watch for text content changes
        });

        return () => {
          mutationObserver.disconnect();
        };
      }
    }
  }, [messagesContainerSelector]);

  const scrollToBottomIfWithinThreshold = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const isScrolledToBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
      threshold;

    if (isScrolledToBottom || messages[messages.length - 1]?.role === "user") {
      scrollToBottom();
    } else {
      setShowScrollButton(true);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;

    const isScrolledToBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
      threshold;
    setShowScrollButton(!isScrolledToBottom);
  };

  return {
    scrollViewportRef,
    showScrollButton,
    scrollToBottom,
    scrollToBottomIfWithinThreshold,
    handleScroll,
  };
}
