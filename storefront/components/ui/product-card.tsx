"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { addToCart } from "@/lib/data/cart";
import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Loader2, Search, ShoppingCart, Stars } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProductCardProps {
  id: string;
  product_id: string;
  name: string;
  price: number;
  thumbnail: string;
  description: string;
  best_option?: boolean;
  might_also_like?: boolean;
}

export function ProductCard({
  id,
  product_id,
  name,
  price,
  thumbnail,
  description,
  best_option,
  might_also_like,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [longTitle, setLongTitle] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleAddToCart = async () => {
    setAdded(true);

    await addToCart({
      variantId: id,
      quantity: 1,
      countryCode: "us",
    });

    setTimeout(() => setAdded(false), 2000);
  };

  const cardTitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const longTitle =
      cardTitleRef?.current?.clientHeight &&
      cardTitleRef?.current?.clientHeight > 24;

    setLongTitle(longTitle || false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
      whileHover={{ y: -5 }}
      className="select-none"
    >
      <Card className="flex flex-col overflow-hidden relative min-h-full justify-between">
        <Link
          href={`/product/${product_id}`}
          className="w-full h-full"
          prefetch={true}
        >
          <div className="w-full h-fit aspect-square overflow-hidden relative group cursor-pointer">
            {!loaded && (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}

            <Image
              src={thumbnail || "/placeholder.svg"}
              alt={name}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              fill
              quality={50}
              priority
              className={cn(
                "h-full w-full object-cover transition-all duration-100 group-hover:scale-105",
                {
                  "opacity-100": loaded,
                  "opacity-0": !loaded,
                }
              )}
              onLoad={() => setLoaded(true)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Search className="h-10 w-10 text-white" />
            </div>
            {best_option && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-400 text-white px-2 py-1 text-xs font-medium rounded-full">
                <Stars className="h-3 w-3" />
                Best Option
              </div>
            )}
            {might_also_like && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-200 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
                Might Also Like
              </div>
            )}
          </div>
        </Link>

        <CardContent className="p-4 flex flex-col gap-2 h-full justify-between">
          <h3 className="font-medium line-clamp-2" ref={cardTitleRef}>
            {name}
          </h3>
          <p
            className={cn(
              "text-sm text-muted-foreground",
              longTitle ? "line-clamp-3" : "line-clamp-4"
            )}
          >
            {description}
          </p>
          <p className="font-medium">{formatCurrency(price)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={handleAddToCart}
            variant={added ? "secondary" : "default"}
          >
            {added ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
