"use client";

import { cn } from "@/lib/utils";
import { HttpTypes } from "@medusajs/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { PaymentForm } from "@/components/checkout/payment-form";
import { DetailsForm } from "@/components/checkout/details-form";
import { useState, useEffect, useMemo } from "react";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: HttpTypes.StoreCart | null;
  availableShippingOptions: HttpTypes.StoreCartShippingOption[] | null;
  className?: string;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  cart,
  availableShippingOptions,
  className,
}: CheckoutDrawerProps) {
  const maxStep = useMemo(() => {
    return !cart?.email
      ? 1
      : !cart?.shipping_address?.address_1
      ? 2
      : !cart?.payment_collection?.payments?.length
      ? 3
      : 4;
  }, [cart]);

  const [currentStep, setCurrentStep] = useState(maxStep);

  useEffect(() => {
    setCurrentStep(maxStep);
  }, [cart]);

  const handleStepChange = (step: number) => {
    if (step > maxStep) {
      return;
    }
    setCurrentStep(step);
  };

  const previousStep = () => {
    handleStepChange(currentStep - 1);
  };

  const nextStep = () => {
    handleStepChange(currentStep + 1);
  };

  if (!availableShippingOptions || !cart) {
    return null;
  }

  const nextStepUi =
    currentStep === 1 ? (
      <DetailsForm cart={cart} nextStep={nextStep} onClose={onClose} />
    ) : currentStep === 2 ? (
      <ShippingForm
        cart={cart}
        nextStep={nextStep}
        previousStep={previousStep}
        availableShippingOptions={availableShippingOptions}
      />
    ) : currentStep === 3 ? (
      <PaymentForm
        cart={cart}
        nextStep={nextStep}
        previousStep={previousStep}
      />
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
            className="h-full rounded-lg overflow-hidden p-6"
          >
            <div className="h-full flex flex-col space-y-6">
              <div className="z-10 grid grid-cols-4 grid-rows-1 w-full h-12 divide-x divide-background rounded-lg overflow-hidden">
                {["Details", "Shipping", "Payment", "Overview"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className={cn(
                        "flex h-12 justify-center select-none gap-2 items-center text-sm p-2 transition-all duration-300",
                        index === 0 ? "rounded-l-lg" : "",
                        index === 3 ? "rounded-r-lg" : "",
                        currentStep === index + 1
                          ? "text-white bg-black border border-primary cursor-pointer"
                          : currentStep > index + 1
                          ? "text-white bg-primary cursor-pointer hover:brightness-110"
                          : index < maxStep
                          ? "text-muted-foreground bg-secondary cursor-pointer hover:bg-primary hover:text-white"
                          : "text-muted-foreground bg-secondary cursor-not-allowed"
                      )}
                      onClick={() => handleStepChange(index + 1)}
                    >
                      <span>{index + 1}.</span>
                      {step}
                      {currentStep > index + 1 && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )
                )}
              </div>
              <div className="overflow-y-scroll h-[calc(100%-4rem)]">
                {nextStepUi}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
