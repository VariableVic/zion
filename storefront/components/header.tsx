import { CartButton } from "@/components/cart/cart-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export function Header() {
  return (
    <>
      <header className="sticky h-16 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex gap-4 h-full items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-2xl">Zion</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
            <Suspense
              fallback={
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
}
