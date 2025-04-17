"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { addToCart } from "@/lib/data/cart";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MinusCircle,
  PlusCircle,
  Share2,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ProductDrawerProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  images: string[];
}

export function ProductDrawer({
  id,
  name,
  description,
  price,
  images,
}: ProductDrawerProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleAddToCart = () => {
    if (!id) return;

    addToCart({
      variantId: id,
      quantity,
      countryCode: "us",
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images]);

  return (
    <DrawerContent className="max-h-[95vh] overflow-y-hidden">
      <div className="grid md:grid-cols-2 gap-6 p-6 max-h-full overflow-y-hidden">
        {/* Image gallery */}
        <div className="relative h-[75%]">
          <div className="aspect-square relative rounded-lg overflow-hidden h-full">
            {!isImageLoaded && (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {images.length > 0 ? (
              <Image
                src={images[activeImage] || "/placeholder.svg"}
                alt={name}
                className="object-cover"
                quality={30}
                fill
                priority
                onLoad={() => {
                  setIsImageLoaded(true);
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors text-black"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors text-black"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "h-16 w-16 rounded-md overflow-hidden border-2 flex-shrink-0",
                    activeImage === i
                      ? "border-purple-500"
                      : "border-transparent"
                  )}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${name} thumbnail ${i}`}
                    width={64}
                    height={64}
                    quality={20}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col max-h-[75%]">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2">
                In Stock
              </Badge>
              <DrawerTitle className="text-2xl font-bold">{name}</DrawerTitle>
              <p className="text-xl font-semibold mt-2 text-purple-600">
                {formatCurrency(price)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-base leading-relaxed mb-6 whitespace-pre-wrap overflow-y-auto max-h-[300px]">
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>

          <div className="mt-auto">
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdded || !id}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  );
}
