"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  best_option?: boolean;
  might_also_like?: boolean;
  score?: number;
}

export function ProductCard({
  id,
  name,
  price,
  image,
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
      image,
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
      <Card className="overflow-hidden relative">
        <div className="aspect-square overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {best_option && (
            <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 text-xs font-medium rounded-full">
              Best Option
            </div>
          )}
          {might_also_like && (
            <div className="absolute top-2 right-2 bg-purple-400 text-white px-2 py-1 text-xs font-medium rounded-full">
              Might Also Like
            </div>
          )}
        </div>
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
    </motion.div>
  );
}
