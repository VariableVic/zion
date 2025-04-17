"use client";

import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Button } from "@/components/ui/button";
import { HttpTypes } from "@medusajs/types";
import { ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function CartButtonClient({
  cart,
}: {
  cart: HttpTypes.StoreCart | null;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const cartItems = cart?.items || [];
  const itemCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const itemRef = useRef(itemCount);

  useEffect(() => {
    if (itemCount !== itemRef.current && itemCount > 0) {
      setIsCartOpen(true);
    }
    itemRef.current = itemCount;

    const timeout = setTimeout(() => {
      setIsCartOpen(false);
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [itemCount]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={toggleCart}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Button>
      {isMounted &&
        createPortal(
          <CartSidebar
            cart={cart}
            isOpen={isCartOpen}
            toggleCart={toggleCart}
          />,
          document.getElementById("sidebar-portal")!
        )}
    </>
  );
}
