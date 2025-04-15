"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import Link from "next/link";
// import { useCart } from "@/context/cart-context";
import { HttpTypes } from "@medusajs/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartSidebar } from "./cart/cart-sidebar";

export function Header({
  categories,
  cart,
}: {
  categories: HttpTypes.StoreProductCategory[];
  cart?: HttpTypes.StoreCart | null;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
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
    if (itemCount !== itemRef.current) {
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
      <header className="sticky h-16 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex gap-4 h-full items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-2xl">Zion</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
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
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <CartSidebar cart={cart} isOpen={isCartOpen} toggleCart={toggleCart} />
    </>
  );
}
