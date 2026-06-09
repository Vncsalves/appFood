import * as SecureStore from 'expo-secure-store'

export const BASE_URL = 'https://app-food-backend-vqrm.onrender.com'

let userToken = null
let unauthorizedHandler = null
let handlingUnauthorized = false

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

export async function setToken(token) {
  userToken = token
  try {
    if (token) {
      await SecureStore.setItemAsync('userToken', token)
    } else {
      await SecureStore.deleteItemAsync('userToken')
    }
  } catch (error) {
    console.error('Failed to set secure token:', error)
  }
}

export async function getToken() {
  if (userToken) return userToken
  try {
    const persisted = await SecureStore.getItemAsync('userToken')
    if (persisted) userToken = persisted
  } catch (error) {
    console.error('Failed to get secure token:', error)
  }
  return userToken
}

function buildErrorMessage(data, status, defaultMsg) {
  let msg = ''
  if (data && data.message) {
    msg = Array.isArray(data.message) ? data.message.join('\n') : String(data.message)
  }
  if (msg) return msg
  if (status === 400) return 'Dados inválidos. Verifique e tente novamente.'
  if (status === 401) return 'Sessão expirada. Por favor, faça login novamente.'
  if (status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 409) return 'Conflito: este recurso já existe.'
  if (status === 500) return 'Erro interno no servidor. Tente novamente mais tarde.'
  if (status >= 500) return 'Servidor indisponível. Tente novamente mais tarde.'
  return defaultMsg
}

export async function apiRequest(path, options = {}, defaultError = 'Erro na requisição.') {
  const { requireAuth = true, headers = {}, ...rest } = options
  const finalHeaders = { 'accept': '*/*', ...headers }

  if (requireAuth) {
    const token = await getToken()
    if (!token) {
      const err = new Error('Sessão expirada. Por favor, faça login novamente.')
      err.status = 401
      throw err
    }
    finalHeaders['Authorization'] = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...rest, headers: finalHeaders })
  } catch (err) {
    console.error(`Network error on ${path}:`, err)
    throw new Error('Falha de conexão. Verifique sua internet e tente novamente.')
  }

  let data = {}
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      if (text) data = { message: text }
    }
  } catch (e) {
    data = {}
  }

  if (!response.ok) {
    const msg = buildErrorMessage(data, response.status, defaultError)
    console.error(`API error ${response.status} on ${path}:`, msg)

    if (response.status === 401 && requireAuth && !handlingUnauthorized) {
      handlingUnauthorized = true
      await setToken(null)
      try {
        if (unauthorizedHandler) unauthorizedHandler()
      } catch (e) {
        console.error('Unauthorized handler error:', e)
      }
      setTimeout(() => { handlingUnauthorized = false }, 2000)
    }

    const error = new Error(msg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
