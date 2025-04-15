"use client";

import type React from "react";

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
import { setAddresses } from "@/lib/data/cart";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export function ShippingForm({ onClose }: { onClose: () => void }) {
  const [formState, setFormState] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    state: "",
    zip_code: "",
    country: "us",
    phone: "",
    company: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormState((prev) => ({ ...prev, [name]: value }));
    console.log({ formState });
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(name, value);
    setFormState((prev) => ({ ...prev, [name]: value }));
    console.log({ formState });
  };

  return (
    <form
      className="flex flex-col space-y-6 h-full"
      action={async (formData) => {
        await setAddresses(formState, formData);
      }}
    >
      <div className="flex flex-col space-y-4">
        <h2 className="text-base font-semibold">Contact Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4">
        <h2 className="text-base font-semibold">Shipping Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formState.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formState.last_name}
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
            value={formState.address_1}
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
              value={formState.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              name="state"
              value={formState.state}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP/Postal Code</Label>
            <Input
              id="zip_code"
              name="zip_code"
              value={formState.zip_code}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              name="country"
              value={formState.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-4 gap-2 items-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="col-span-1"
          type="button"
        >
          Cancel
        </Button>
        <Button type="submit" className="col-span-3">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}
