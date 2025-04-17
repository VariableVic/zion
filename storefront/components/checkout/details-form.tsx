"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setDetails } from "@/lib/data/cart";
import { HttpTypes } from "@medusajs/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
export function DetailsForm({
  onClose,
  cart,
  nextStep,
}: {
  onClose: () => void;
  cart: HttpTypes.StoreCart;
  nextStep: () => void;
}) {
  const [data, setData] = useState({
    phone: cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);
    setData((prev) => ({ ...prev, [name]: value }));
    console.log({ data });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await setDetails(data.email, data.phone).then(() => {
      nextStep();
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={data.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onClose}
          className="col-span-1"
          type="button"
        >
          Cancel
        </Button>
        <Button
          className="col-span-3"
          onClick={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
        >
          Continue to Shipping
        </Button>
      </CardFooter>
    </Card>
  );
}
