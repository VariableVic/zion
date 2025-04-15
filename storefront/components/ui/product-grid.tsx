"use client";

import type { ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from "react";
interface ProductGridProps {
  title?: string;
  children: ReactNode;
}

export function ProductGrid({ title, children }: ProductGridProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full space-y-4"
    >
      <div className="flex justify-between items-center">
        {title && <p className="text-lg font-bold">{title}</p>}
        <div className="flex gap-2 select-none items-center">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </div>
      <CarouselContent className="h-full w-full">
        {React.Children.map(children, (child, index) => (
          <CarouselItem className="basis md:basis-1/2 lg:basis-1/3 pl-4">
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
