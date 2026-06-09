import { apiRequest } from './base'

export async function createOrder({ restaurantId, deliveryAddressId, items, paymentMethod, couponCode }) {
  const body = { restaurantId, deliveryAddressId, items }
  if (paymentMethod) body.paymentMethod = paymentMethod
  if (couponCode) body.couponCode = couponCode

  return apiRequest('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, 'Erro ao criar pedido no servidor.')
}

export async function fetchOrders() {
  return apiRequest('/orders', {}, 'Erro ao buscar pedidos no servidor.')
}

export async function markOrderPaid(orderId) {
  return apiRequest(`/orders/${orderId}/pay`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }, 'Erro ao confirmar pagamento.')
}

export async function cancelOrder(orderId) {
  return apiRequest(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }, 'Erro ao cancelar pedido.')
}
