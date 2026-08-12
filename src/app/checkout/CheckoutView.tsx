"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { placeOrderAction, type CheckoutActionState } from "./actions";
import type {
  CartItem,
  CartSummary,
  SavedAddress,
} from "@/lib/storefront-data";

type CheckoutViewProps = {
  userName: string;
  userEmail: string;
  addresses: SavedAddress[];
  items: CartItem[];
  summary: CartSummary;
};

const initialState: CheckoutActionState = {
  error: null,
};

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Placing order..." : "Place COD order"}
    </button>
  );
}

function TextInput({
  label,
  name,
  defaultValue,
  required = false,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}

      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-full border border-stone-300 bg-white px-4 py-3 text-[#2f1d24] outline-none transition focus:border-[#7A1F3D]"
      />
    </label>
  );
}

export default function CheckoutView({
  userName,
  userEmail,
  addresses,
  items,
  summary,
}: CheckoutViewProps) {
  const defaultAddress =
    addresses.find((address) => address.isDefault) || addresses[0];

  const [addressMode, setAddressMode] = useState<"saved" | "new">(
    defaultAddress ? "saved" : "new"
  );

  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?.id || ""
  );

  const [state, setState] =
    useState<CheckoutActionState>(initialState);

  const [pending, setPending] = useState(false);

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (address) => address.id === selectedAddressId
      ) || defaultAddress,
    [addresses, defaultAddress, selectedAddressId]
  );

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPending(true);
    setState(initialState);

    try {
      const formData = new FormData(event.currentTarget);

      const result = await placeOrderAction(
        initialState,
        formData
      );

      setState(result);
    } catch (error) {
      console.error("Checkout error:", error);

      setState({
        error: "Unable to place the order. Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDF8] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[#f0dfcf] bg-white/80 p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">
              Checkout
            </p>

            <h1 className="font-serif text-3xl text-[#7A1F3D]">
              Complete your order
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              Signed in as {userName || userEmail}
            </p>
          </div>

          <Link
            href="/cart"
            className="rounded-full border border-[#d8bb87] px-4 py-2 text-sm font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
          >
            Back to cart
          </Link>
        </div>

        {/* Checkout Form */}
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <input
            type="hidden"
            name="addressMode"
            value={addressMode}
          />

          <input
            type="hidden"
            name="savedAddressId"
            value={
              addressMode === "saved"
                ? selectedAddressId
                : ""
            }
          />

          {/* Shipping */}
          <section className="space-y-6 rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">
                Shipping
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#7A1F3D]">
                Delivery address
              </h2>
            </div>

            {/* Saved Addresses */}
            {addresses.length ? (
              <div className="grid gap-3">

                <button
                  type="button"
                  onClick={() => setAddressMode("saved")}
                  className={`rounded-full border px-4 py-3 text-left text-sm font-medium transition ${
                    addressMode === "saved"
                      ? "border-[#7A1F3D] bg-[#F5EBDD] text-[#7A1F3D]"
                      : "border-stone-200 text-stone-700 hover:bg-[#FFFDF8]"
                  }`}
                >
                  Use a saved address
                </button>

                {addressMode === "saved" ? (
                  <div className="grid gap-3 sm:grid-cols-2">

                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex cursor-pointer gap-3 rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4 text-sm text-stone-700"
                      >
                        <input
                          type="radio"
                          name="selectedSavedAddress"
                          value={address.id}
                          checked={
                            selectedAddressId === address.id
                          }
                          onChange={() =>
                            setSelectedAddressId(address.id)
                          }
                          className="mt-1"
                        />

                        <span>
                          <span className="block font-semibold text-[#2f1d24]">
                            {address.label}
                            {address.isDefault
                              ? " (Default)"
                              : ""}
                          </span>

                          <span className="mt-1 block">
                            {address.fullName}
                          </span>

                          <span className="block">
                            {address.addressLine1}
                          </span>

                          {address.addressLine2 ? (
                            <span className="block">
                              {address.addressLine2}
                            </span>
                          ) : null}

                          <span className="block">
                            {address.city},{" "}
                            {address.state}{" "}
                            {address.postalCode}
                          </span>

                          <span className="block">
                            {address.country}
                          </span>

                          {address.phone ? (
                            <span className="mt-1 block">
                              Phone: {address.phone}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))}

                  </div>
                ) : null}
              </div>
            ) : null}

            {/* New Address */}
            <div className="grid gap-3">

              <button
                type="button"
                onClick={() => setAddressMode("new")}
                className={`rounded-full border px-4 py-3 text-left text-sm font-medium transition ${
                  addressMode === "new"
                    ? "border-[#7A1F3D] bg-[#F5EBDD] text-[#7A1F3D]"
                    : "border-stone-200 text-stone-700 hover:bg-[#FFFDF8]"
                }`}
              >
                Ship to a new address
              </button>

              {addressMode === "new" ? (
                <div className="grid gap-4 rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4 sm:grid-cols-2">

                  <TextInput
                    label="Address label"
                    name="label"
                    defaultValue="Home"
                  />

                  <TextInput
                    label="Full name"
                    name="fullName"
                    defaultValue={userName}
                    required
                  />

                  <TextInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                  />

                  <TextInput
                    label="Address line 1"
                    name="addressLine1"
                    required
                  />

                  <TextInput
                    label="Address line 2"
                    name="addressLine2"
                  />

                  <TextInput
                    label="City"
                    name="city"
                    required
                  />

                  <TextInput
                    label="State"
                    name="state"
                    required
                  />

                  <TextInput
                    label="Postal code"
                    name="postalCode"
                    required
                  />

                  <TextInput
                    label="Country"
                    name="country"
                    defaultValue="India"
                    required
                  />

                  <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      name="isDefault"
                      defaultChecked={!addresses.length}
                    />

                    Save as default address
                  </label>

                </div>
              ) : null}
            </div>

            {/* Order Notes */}
            <div className="rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">

              <label className="text-sm font-medium text-stone-700">
                Order notes

                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Any sizing, delivery, or gifting notes"
                  className="mt-2 w-full rounded-[1rem] border border-stone-300 bg-white px-4 py-3 text-[#2f1d24] outline-none transition focus:border-[#7A1F3D]"
                />
              </label>

            </div>

            {/* Payment */}
            <div className="rounded-[1.25rem] border border-[#f0dfcf] bg-[#FFFDF8] p-4">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C8A24A]">
                Payment
              </p>

              <div className="mt-3 rounded-[1rem] border border-[#d8bb87] bg-white p-4 text-sm text-stone-700">

                <p className="font-semibold text-[#2f1d24]">
                  Cash on delivery
                </p>

                <p className="mt-1">
                  Pay when your Alankrutha order reaches
                  your doorstep.
                </p>

              </div>
            </div>

            {/* Error */}
            {state.error ? (
              <p className="rounded-[1rem] bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </p>
            ) : null}

          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C8A24A]">
              Review
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#7A1F3D]">
              Order summary
            </h2>

            <div className="mt-5 space-y-4">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-[1.1rem] border border-[#f0dfcf] bg-[#FFFDF8] p-3"
                >
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      "/placeholder-images/banarasi-silk-saree.svg"
                    }
                    alt={
                      item.product?.name ||
                      "Order item"
                    }
                    className="h-16 w-16 rounded-[0.9rem] object-cover"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="font-semibold text-[#2f1d24]">
                      {item.product?.name || "Product"}
                    </p>

                    <p className="text-sm text-stone-600">
                      Qty {item.quantity}
                    </p>

                    <p className="text-sm font-semibold text-[#7A1F3D]">
                      {formatCurrency(
                        (item.product?.price || 0) *
                          item.quantity
                      )}
                    </p>

                  </div>
                </div>
              ))}

            </div>

            {/* Totals */}
            <div className="mt-5 space-y-3 text-sm text-stone-700">

              <div className="flex justify-between">
                <span>Total items</span>
                <span>{summary.itemCount}</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(summary.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {summary.shipping === 0
                    ? "Free"
                    : formatCurrency(summary.shipping)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span>
                  -{formatCurrency(summary.discount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated tax</span>
                <span>
                  {formatCurrency(summary.tax)}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#f0dfcf] pt-3 text-base font-semibold text-[#7A1F3D]">
                <span>Grand total</span>

                <span>
                  {formatCurrency(summary.grandTotal)}
                </span>
              </div>

            </div>

            {/* Selected Address */}
            {selectedAddress && addressMode === "saved" ? (
              <div className="mt-5 rounded-[1rem] bg-[#F8F1E7] p-4 text-sm text-stone-700">

                <p className="font-semibold text-[#2f1d24]">
                  Delivering to {selectedAddress.label}
                </p>

                <p className="mt-1">
                  {selectedAddress.city},{" "}
                  {selectedAddress.state}{" "}
                  {selectedAddress.postalCode}
                </p>

              </div>
            ) : null}

            {/* Actions */}
            <div className="mt-6 space-y-3">

              <SubmitButton pending={pending} />

              <Link
                href="/catalog"
                className="block w-full rounded-full border border-[#d8bb87] px-5 py-3 text-center font-medium text-[#7A1F3D] transition hover:bg-[#F5EBDD]"
              >
                Continue shopping
              </Link>

            </div>

          </aside>
        </form>
      </div>
    </main>
  );
}