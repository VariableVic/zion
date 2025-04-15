import { Message } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

interface UseScrollToBottomProps {
  messages: Message[];
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
  const prevMessagesLengthRef = useRef<number>(0);

  useEffect(() => {
    // Track when new messages are added vs just content updates
    const newMessageAdded = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    // Use RAF to ensure DOM has updated before scrolling
    requestAnimationFrame(() => {
      if (newMessageAdded) {
        // Always scroll to bottom on new message
        scrollToBottom();
      } else {
        scrollToBottomIfWithinThreshold();
      }
    });
  }, [messages]);

  const scrollToBottom = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    // Use RAF to ensure DOM is fully updated before scrolling
    requestAnimationFrame(() => {
      if (!viewport) return;
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollButton(false);
    });
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

    // Use RAF to ensure measurements are accurate after DOM updates
    requestAnimationFrame(() => {
      if (!viewport) return;

      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (
        distanceFromBottom < threshold ||
        messages[messages.length - 1]?.role === "user"
      ) {
        // Use nested RAF to ensure smooth scrolling after measurements
        requestAnimationFrame(() => {
          if (!viewport) return;
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
          setShowScrollButton(false);
        });
      } else {
        setShowScrollButton(true);
      }
    });
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;
    if (!viewport) return;

    // Calculate on next frame for better performance
    requestAnimationFrame(() => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom >= threshold);
    });
  };

  return {
    scrollViewportRef,
    showScrollButton,
    scrollToBottom,
    scrollToBottomIfWithinThreshold,
    handleScroll,
  };
}
