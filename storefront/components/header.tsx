"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/context/cart-context";
import { HttpTypes } from "@medusajs/types";
import { useRouter } from "next/navigation";

export function Header({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[];
}) {
  const { toggleCart, itemCount } = useCart();
  const router = useRouter();

  const handleCategoryClick = (handle: string) => {
    router.replace(`/category/${handle}`, {
      scroll: false,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex  gap-4 h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl">Zion</span>
        </Link>
        {/* {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="rounded-full"
                onClick={() => handleCategoryClick(category.handle)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )} */}

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
  );
}
