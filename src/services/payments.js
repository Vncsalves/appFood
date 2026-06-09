import { apiRequest } from './base'

export async function createCheckout({ orderId, method, customerEmail }) {
  return apiRequest('/payments/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, method, customerEmail })
  }, 'Erro ao processar pagamento.')
}

export async function notifyPaymentApproved(orderId) {
  const payload = {
    orderId,
    status: 'PAID',
    event: 'payment.approved',
    type: 'payment',
    action: 'payment.updated',
    data: { id: orderId, status: 'approved' },
  }

  return apiRequest('/payments/webhook', {
    method: 'POST',
    requireAuth: false,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Erro ao confirmar pagamento no servidor.')
}
