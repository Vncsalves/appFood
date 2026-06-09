import { apiRequest } from './base'

export async function fetchRestaurants() {
  return apiRequest('/restaurants', {}, 'Erro ao buscar restaurantes.')
}

export async function fetchProducts(restaurantId) {
  return apiRequest(`/products?restaurantId=${restaurantId}`, {}, 'Erro ao buscar produtos do cardápio.')
}
