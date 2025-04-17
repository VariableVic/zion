"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { HttpTypes } from "@medusajs/types";
import {
  initiatePaymentSession as initiateMedusaPaymentSession,
  placeOrder,
} from "@/lib/data/cart";
import { listCartPaymentMethods } from "@/lib/data/payment";

export function PaymentForm({
  cart,
  nextStep,
  previousStep,
}: {
  cart: HttpTypes.StoreCart;
  nextStep: () => void;
  previousStep: () => void;
}) {
  const total = cart?.total;
  const clearCart = () => {
    console.log("vic logs clear cart");
  };

  const [formState, setFormState] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const handlePayment = () => {
    setIsProcessing(true);

    onPaymentCompleted();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      // In a real app, you would handle the payment submission and redirect to a confirmation page
      console.log("Payment processed:", formState);
    }, 2000);
  };

  const initiatePaymentSession = async () => {
    if (!cart?.region_id) {
      return;
    }
    await initiateMedusaPaymentSession(cart, {
      provider_id: "pp_system_default",
    });
  };

  useEffect(() => {
    initiatePaymentSession();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardName">Name on Card</Label>
          <Input
            id="cardName"
            name="cardName"
            value={formState.cardName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            value={formState.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryMonth">Expiry Month</Label>
            <Select
              value={formState.expiryMonth}
              onValueChange={(value) =>
                handleSelectChange("expiryMonth", value)
              }
            >
              <SelectTrigger id="expiryMonth">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, "0");
                  return (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryYear">Expiry Year</Label>
            <Select
              value={formState.expiryYear}
              onValueChange={(value) => handleSelectChange("expiryYear", value)}
            >
              <SelectTrigger id="expiryYear">
                <SelectValue placeholder="YY" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = (new Date().getFullYear() + i)
                    .toString()
                    .slice(-2);
                  return (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              name="cvv"
              value={formState.cvv}
              onChange={handleChange}
              placeholder="123"
              required
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isProcessing}
          onClick={handlePayment}
          loading={isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
