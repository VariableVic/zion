"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setAddresses, setShippingMethod } from "@/lib/data/cart";
import { HttpTypes } from "@medusajs/types";
import { useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ShippingForm({
  cart,
  nextStep,
  previousStep,
  availableShippingOptions,
}: {
  cart: HttpTypes.StoreCart;
  nextStep: () => void;
  previousStep: () => void;
  availableShippingOptions: HttpTypes.StoreCartShippingOption[];
}) {
  const [data, setData] = useState({
    first_name: cart?.shipping_address?.first_name || "",
    last_name: cart?.shipping_address?.last_name || "",
    address_1: cart?.shipping_address?.address_1 || "",
    city: cart?.shipping_address?.city || "",
    province: cart?.shipping_address?.province || "",
    postal_code: cart?.shipping_address?.postal_code || "",
    country_code: cart?.shipping_address?.country_code || "",
  });
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const isReady = useMemo(() => {
    return (
      shippingMethodId &&
      data.address_1 &&
      data.city &&
      data.province &&
      data.postal_code &&
      data.country_code
    );
  }, [shippingMethodId, data]);

  const handleSubmit = async () => {
    if (!isReady) {
      return;
    }

    setIsLoading(true);

    await setAddresses(data);

    await setShippingMethod({
      cartId: cart.id,
      shippingMethodId: shippingMethodId || "",
    })
      .catch((err) => {
        setShippingMethodId(shippingMethodId || null);
      })
      .finally(() => {
        setIsLoading(false);
      });
    nextStep();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={data.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={data.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_1">Address</Label>
          <Input
            id="address_1"
            name="address_1"
            value={data.address_1}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={data.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">State/Province</Label>
            <Input
              id="province"
              name="province"
              value={data.province}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP/Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={data.postal_code}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              name="country_code"
              value={data.country_code}
              onValueChange={(value) =>
                handleSelectChange("country_code", value)
              }
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shipping_option">Shipping Option</Label>
          <RadioGroup
            name="shipping_option"
            value={shippingMethodId || ""}
            onValueChange={(value) => setShippingMethodId(value)}
            className="flex gap-2"
          >
            {availableShippingOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer group group-hover:border-white group-hover:bg-white group-hover:text-black group-hover:cursor-pointer"
                onClick={() => setShippingMethodId(option.id)}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="flex gap-2 items-center group cursor-pointer"
                >
                  {option.name}
                  <span className="text-xs  bg-primary text-foreground px-1 cursor-pointer">
                    Free
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
          className="col-span-1"
          type="button"
        >
          Back to Details
        </Button>
        <Button
          className="col-span-3"
          onClick={handleSubmit}
          disabled={isLoading || !isReady}
          loading={isLoading}
        >
          Continue to Payment
        </Button>
      </CardFooter>
    </Card>
  );
}
