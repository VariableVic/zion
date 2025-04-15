"use client";

import { HttpTypes } from "@medusajs/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { ShippingForm } from "../checkout/shipping-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart?: HttpTypes.StoreCart | null;
  className?: string;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  cart,
  className,
}: CheckoutDrawerProps) {
  const currentStep = !cart?.shipping_address?.address_1
    ? 1
    : cart?.payment_collection
    ? 2
    : 3;

  const nextStep =
    currentStep === 1 ? (
      <ShippingForm onClose={onClose} />
    ) : currentStep === 2 ? (
      <PaymentForm />
    ) : (
      <div>Complete</div>
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="h-full overflow-y-auto rounded-lg"
          >
            <div className="grid grid-cols-3 border-b grid-rows-1 w-full divide-x divide-background">
              {["Shipping", "Payment", "Overview"].map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    "flex justify-center gap-2 items-center text-sm text-muted-foreground bg-secondary p-2",
                    currentStep === index + 1 &&
                      "text-white bg-black border border-primary",
                    index === 0 && "rounded-tl-lg",
                    index === 2 && "rounded-tr-lg"
                  )}
                >
                  <span>{index + 1}.</span>
                  {step}
                  {currentStep > index + 1 && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-6">{nextStep}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PaymentForm() {
  return <div>Payment Form</div>;
}
