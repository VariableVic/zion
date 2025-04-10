"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Search, ShoppingCart, Stars } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductDrawer } from "@/components/canvas/product-drawer";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  images: string[];
  description: string;
  best_option?: boolean;
  might_also_like?: boolean;
  score?: number;
}

export function ProductCard({
  id,
  name,
  price,
  thumbnail,
  images,
  description,
  best_option,
  might_also_like,
  score,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      quantity: 1,
      thumbnail,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Drawer>
        <Card className="overflow-hidden relative">
          <DrawerTrigger>
            <div className="w-full h-full aspect-square overflow-hidden relative group">
              <Image
                src={thumbnail || "/placeholder.svg"}
                alt={name}
                width={300}
                height={300}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          </DrawerTrigger>

          <CardContent className="p-4">
            <h3 className="font-medium">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
              {score && (
                <span className="text-xs text-muted-foreground">
                  {score.toFixed(2)}
                </span>
              )}
            </p>
            <p className="mt-2 font-medium">{formatCurrency(price)}</p>
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
        <ProductDrawer
          id={id}
          name={name}
          description={description}
          price={price}
          thumbnail={thumbnail}
          images={images}
        />
      </Drawer>
    </motion.div>
  );
}
