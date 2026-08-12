'use client';

import { useState, useTransition } from 'react';
import {
  type AdminOrderDetails,
  orderStatusOptions,
  paymentStatusOptions,
} from '@/lib/admin-orders-data';
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
  type StatusActionState,
} from '../actions';
import { formatStatusLabel } from '../order-ui';

type StatusUpdateFormsProps = {
  orderId: string;
  orderStatus: string;
  payment: AdminOrderDetails['payment'];
};

const initialState: StatusActionState = {
  error: null,
  message: null,
};

export default function StatusUpdateForms({
  orderId,
  orderStatus,
  payment,
}: StatusUpdateFormsProps) {
  const [orderState, setOrderState] =
    useState<StatusActionState>(initialState);

  const [paymentState, setPaymentState] =
    useState<StatusActionState>(initialState);

  const [orderPending, startOrderTransition] = useTransition();
  const [paymentPending, startPaymentTransition] = useTransition();

  const handleOrderSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startOrderTransition(async () => {
      try {
        const result = await updateOrderStatusAction(
          initialState,
          formData
        );

        setOrderState(result);
      } catch (error) {
        setOrderState({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update order status.',
          message: null,
        });
      }
    });
  };

  const handlePaymentSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startPaymentTransition(async () => {
      try {
        const result = await updatePaymentStatusAction(
          initialState,
          formData
        );

        setPaymentState(result);
      } catch (error) {
        setPaymentState({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update payment status.',
          message: null,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl text-[#7A1F3D]">
          Update order
        </h2>

        <form
          onSubmit={handleOrderSubmit}
          className="mt-4 space-y-3"
        >
          <input
            type="hidden"
            name="orderId"
            value={orderId}
          />

          <select
            name="status"
            defaultValue={orderStatus}
            disabled={orderPending}
            className="w-full rounded-full border border-stone-300 px-4 py-3 outline-none transition focus:border-[#7A1F3D]"
          >
            {orderStatusOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={orderPending}
            className="w-full rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {orderPending
              ? 'Updating...'
              : 'Update order status'}
          </button>
        </form>

        {orderState.error ? (
          <p className="mt-3 rounded-[1rem] bg-red-50 px-4 py-3 text-sm text-red-700">
            {orderState.error}
          </p>
        ) : null}

        {orderState.message ? (
          <p className="mt-3 rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {orderState.message}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.5rem] border border-[#f0dfcf] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-2xl text-[#7A1F3D]">
          Update payment
        </h2>

        {payment ? (
          <>
            <form
              onSubmit={handlePaymentSubmit}
              className="mt-4 space-y-3"
            >
              <input
                type="hidden"
                name="orderId"
                value={orderId}
              />

              <input
                type="hidden"
                name="paymentId"
                value={payment.id}
              />

              <select
                name="status"
                defaultValue={String(payment.status)}
                disabled={paymentPending}
                className="w-full rounded-full border border-stone-300 px-4 py-3 outline-none transition focus:border-[#7A1F3D]"
              >
                {paymentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={paymentPending}
                className="w-full rounded-full bg-[#7A1F3D] px-5 py-3 font-medium text-white transition hover:bg-[#5b152d] disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {paymentPending
                  ? 'Updating...'
                  : 'Update payment status'}
              </button>
            </form>

            {paymentState.error ? (
              <p className="mt-3 rounded-[1rem] bg-red-50 px-4 py-3 text-sm text-red-700">
                {paymentState.error}
              </p>
            ) : null}

            {paymentState.message ? (
              <p className="mt-3 rounded-[1rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {paymentState.message}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-4 rounded-[1rem] bg-[#FFFDF8] px-4 py-3 text-sm text-stone-600">
            No payment record was found for this order.
          </p>
        )}
      </section>
    </div>
  );
}
