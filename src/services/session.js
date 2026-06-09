import { setToken, apiRequest } from './base'

export async function loginUser(email, password) {
  const data = await apiRequest('/users/login', {
    method: 'POST',
    requireAuth: false,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }, 'E-mail ou senha incorretos.')

  if (data && data.token) {
    await setToken(data.token)
  }
  return data
}

export async function registerUser({ name, email, password, cpf, phone, photoFile }) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('email', email)
  formData.append('password', password)
  formData.append('cpf', cpf)
  if (phone) formData.append('phone', phone)
  formData.append('role', 'CUSTOMER')
  if (photoFile) formData.append('photo', photoFile)

  return apiRequest('/users/register', {
    method: 'POST',
    requireAuth: false,
    body: formData
  }, 'Erro ao cadastrar usuário. Verifique os dados e tente novamente.')
}

export async function fetchUserProfile() {
  return apiRequest('/users/me', {}, 'Erro ao buscar perfil do usuário.')
}

export async function updateUserProfile(id, { name, cpf, phone, photoFile }) {
  const formData = new FormData()
  if (name) formData.append('name', name)
  if (cpf) formData.append('cpf', cpf)
  if (phone) formData.append('phone', phone)
  if (photoFile) formData.append('photo', photoFile)

  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: formData
  }, 'Erro ao atualizar perfil do usuário.')
}

export async function fetchUserAddresses() {
  return apiRequest('/users/me/addresses', {}, 'Erro ao buscar endereços do usuário.')
}

export async function createUserAddress({ street, city, state, zipCode, isDefault = true, latitude = 0, longitude = 0 }) {
  return apiRequest('/users/me/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ street, city, state, zipCode, isDefault, latitude, longitude })
  }, 'Erro ao criar endereço no servidor.')
}
