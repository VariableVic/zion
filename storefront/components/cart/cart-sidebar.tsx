"use client";

import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { HttpTypes } from "@medusajs/types";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export function CartSidebar({
  cart,
  isOpen,
  toggleCart,
}: {
  cart?: HttpTypes.StoreCart | null;
  isOpen: boolean;
  toggleCart: () => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        toggleCart();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, toggleCart]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        toggleCart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, toggleCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-y-0 right-0 z-[9999] w-full max-w-sm border-l bg-background shadow-xl sm:w-96"
        >
          <div className="flex h-full flex-col" ref={sidebarRef}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-heading text-lg">Your Cart</h2>
              <Button variant="ghost" size="icon" onClick={toggleCart}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {!cart?.items?.length ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted p-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-10 w-10 text-muted-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask the AI assistant to help you find products to add to your
                  cart.
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="space-y-4">
                    {cart?.items?.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(cart?.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Shipping</span>
                    <span className="text-sm font-medium">
                      Calculated at checkout
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-base font-medium">Total</span>
                    <span className="text-base font-medium">
                      {formatCurrency(cart?.total)}
                    </span>
                  </div>
                  <Button className="mt-4 w-full">Checkout</Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
