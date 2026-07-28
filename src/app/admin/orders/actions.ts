'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAppUser } from '@/lib/auth';
import {
  isOrderStatus,
  isPaymentStatus,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from '@/lib/admin-orders-data';

export type StatusActionState = {
  error: string | null;
  message: string | null;
};

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

async function isCurrentUserAdmin() {
  const user = await getCurrentAppUser();
  return Boolean(user?.is_admin);
}

export async function updateOrderStatusAction(
  _previousState: StatusActionState,
  formData: FormData,
): Promise<StatusActionState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: 'Only admins can update orders.', message: null };
  }

  const orderId = getFormString(formData, 'orderId');
  const status = getFormString(formData, 'status');

  if (!orderId || !isOrderStatus(status)) {
    return { error: 'Choose a valid order status.', message: null };
  }

  const result = await updateAdminOrderStatus(orderId, status);
  if (result.error) {
    return { error: result.error.message || 'Unable to update order status.', message: null };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null, message: 'Order status updated.' };
}

export async function updatePaymentStatusAction(
  _previousState: StatusActionState,
  formData: FormData,
): Promise<StatusActionState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: 'Only admins can update payments.', message: null };
  }

  const orderId = getFormString(formData, 'orderId');
  const paymentId = getFormString(formData, 'paymentId');
  const status = getFormString(formData, 'status');

  if (!orderId || !paymentId || !isPaymentStatus(status)) {
    return { error: 'Choose a valid payment status.', message: null };
  }

  const result = await updateAdminPaymentStatus(paymentId, orderId, status);
  if (result.error) {
    return { error: result.error.message || 'Unable to update payment status.', message: null };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null, message: 'Payment status updated.' };
}
