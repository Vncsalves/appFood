import { apiRequest } from './base'

export async function fetchCoupons(restaurantId) {
  return apiRequest(`/coupons?restaurantId=${restaurantId}`, {}, 'Erro ao buscar cupons no servidor.')
}
