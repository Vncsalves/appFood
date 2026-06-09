import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'
import { createOrder, fetchOrders, markOrderPaid, cancelOrder, fetchRestaurants, createUserAddress, fetchUserAddresses, createCheckout, fetchUserProfile } from '../services/api'

const CartContext = createContext()



function mapBackendStatus(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'AWAITING_PAYMENT' || s === 'PENDING' || s === 'PENDENTE') {
    return { status: 'Pendente', color: '#FFB800', type: 'Em andamento', eta: 'Aguardando pagamento' }
  }
  if (s === 'PAID' || s === 'PAGO' || s === 'APPROVED' || s === 'CONFIRMED') {
    return { status: 'Pago', color: '#4CAF50', type: 'Em andamento', eta: 'Pagamento confirmado' }
  }
  if (s === 'PREPARING' || s === 'PREPARANDO') {
    return { status: 'Em preparo', color: '#FFB800', type: 'Em andamento', eta: 'Restaurante preparando o pedido' }
  }
  if (s === 'READY' || s === 'READY_FOR_PICKUP') {
    return { status: 'Pronto p/ retirada', color: '#FF8B5E', type: 'Em andamento', eta: 'Entregador a caminho do restaurante' }
  }
  if (s === 'ACCEPTED' || s === 'ACCEPTED_BY_COURIER') {
    return { status: 'Entrega iniciada', color: '#FF8B5E', type: 'Em andamento', eta: 'Entregador a caminho do restaurante' }
  }
  if (s === 'SHIPPED' || s === 'A_CAMINHO' || s === 'OUT_FOR_DELIVERY' || s === 'IN_TRANSIT') {
    return { status: 'A caminho', color: '#FF8B5E', type: 'Em andamento', eta: 'Entregador a caminho do seu endereço' }
  }
  if (s === 'DELIVERED' || s === 'ENTREGUE') {
    return { status: 'Entregue', color: '#4CAF50', type: 'Concluídos', eta: 'Pedido entregue' }
  }
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'CANCELADO') {
    return { status: 'Cancelado', color: '#F44336', type: 'Cancelados', eta: 'Pedido cancelado' }
  }

  return { status: 'Processando', color: '#FFB800', type: 'Em andamento', eta: 'Aguardando confirmação' }
}

function formatOrderDate(dateString) {
  try {
    const d = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = d.toDateString() === today.toDateString()
    const isYesterday = d.toDateString() === yesterday.toDateString()

    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    if (isToday) return `Hoje, ${timeStr}`
    if (isYesterday) return `Ontem, ${timeStr}`

    return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} ${timeStr}`
  } catch (e) {
    return 'Hoje'
  }
}

export function getDeliveryFeeForRestaurant(restaurantId) {
  const fees = [0, 6.90, 4.90]
  const index = (restaurantId - 1) % 3
  return fees[index >= 0 ? index : 0]
}

function mapPaymentMethod(method) {
  const map = {
    'Pix': 'PIX',
    'Cartão de Crédito': 'CREDIT_CARD',
    'Cartão de Débito': 'DEBIT_CARD',
    'Dinheiro': 'CASH',
  }
  return map[method] || method
}

function formatAddress(addr) {
  if (!addr) return ''
  const street = addr.street || ''
  const city = addr.city || ''
  const state = addr.state || ''
  const parts = [street, [city, state].filter(Boolean).join(' - ')].filter(Boolean)
  return parts.join(', ')
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [address, setAddress] = useState('')
  const [addressId, setAddressId] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [orders, setOrders] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('Pix')

  useEffect(() => {
    async function loadPersistedData() {
      try {
        const savedCart = await SecureStore.getItemAsync('cartItems')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        }

        try {
          const backendAddresses = await fetchUserAddresses()
          if (backendAddresses && backendAddresses.length > 0) {
            setAddresses(backendAddresses)
            const defaultAddr = backendAddresses.find(a => a.isDefault) || backendAddresses[0]
            setAddressId(defaultAddr.id)
            const fullAddr = formatAddress(defaultAddr)
            setAddress(fullAddr)
            await SecureStore.setItemAsync('userAddress', fullAddr)
          } else {
            setAddresses([])
            setAddressId(null)
            setAddress('')
            await SecureStore.deleteItemAsync('userAddress').catch(() => {})
          }
        } catch (err) {
          console.log('Failed to load backend addresses on mount:', err)
        }

        try {
          await SecureStore.deleteItemAsync('userOrders')
        } catch (err) {}
        const savedPayment = await SecureStore.getItemAsync('userPaymentMethod')
        if (savedPayment) {
          setPaymentMethod(savedPayment)
        }
      } catch (error) {
        console.error('Error loading persisted data:', error)
      }
    }
    loadPersistedData()
  }, [])

  const persistCart = async (items) => {
    try {
      await SecureStore.setItemAsync('cartItems', JSON.stringify(items))
    } catch (error) {
      console.error('Error persisting cart items:', error)
    }
  }

  const persistAddress = async (newAddress) => {
    try {
      await SecureStore.setItemAsync('userAddress', newAddress)
    } catch (error) {
      console.error('Error persisting address:', error)
    }
  }

  const persistOrders = async (_items) => {
    return
  }

  const persistPaymentMethod = async (method) => {
    try {
      await SecureStore.setItemAsync('userPaymentMethod', method)
    } catch (error) {
      console.error('Error persisting payment method:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const backendOrders = await fetchOrders()

      let receiptsObj = {}
      try {
        const savedReceipts = await SecureStore.getItemAsync('orderReceipts')
        if (savedReceipts) {
          receiptsObj = JSON.parse(savedReceipts)
        }
      } catch (err) {
        console.log('Error reading orderReceipts:', err)
      }
      
      let currentRestaurants = restaurants
      if (currentRestaurants.length === 0) {
        try {
          currentRestaurants = await fetchRestaurants()
          setRestaurants(currentRestaurants)
        } catch (err) {
          console.log('Error loading restaurants in context:', err)
        }
      }

      const mapped = backendOrders.map(order => {
        const matchedStore = currentRestaurants.find(r => r.id === order.restaurantId)
        const storeName = matchedStore ? matchedStore.name : 'E-Dento Food'

        const storeIndex = currentRestaurants.findIndex(r => r.id === order.restaurantId)
        const storeImage = matchedStore 
          ? matchedStore.image 
          : { uri: [
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
              'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800'
            ][(storeIndex >= 0 ? storeIndex : 0) % 3] }

        const statusDetails = mapBackendStatus(order.status)
        const totalItems = order.items ? order.items.reduce((acc, i) => acc + i.quantity, 0) : 0

        const receipt = receiptsObj[order.id] || { paymentMethod: 'Pix', address: address }

        const matchedRestaurantId = order.restaurantId || 1
        const deliveryFee = order.total > 0 ? getDeliveryFeeForRestaurant(matchedRestaurantId) : 0

        return {
          id: order.id,
          restaurantId: matchedRestaurantId,
          store: storeName,
          image: storeImage,
          status: statusDetails.status,
          eta: statusDetails.eta,
          total: (parseFloat(order.total) || 0) + deliveryFee,
          items: totalItems,
          itemsList: order.items || [],
          date: formatOrderDate(order.createdAt),
          statusColor: statusDetails.color,
          type: statusDetails.type,
          paymentMethod: receipt.paymentMethod || 'Pix',
          address: receipt.address || address,
          deliveryVerificationCode: order.deliveryVerificationCode || '1234',
          deliveryFee: deliveryFee,
        }
      })

      setOrders(mapped)
      await persistOrders(mapped)
    } catch (error) {
      console.log('Error loading orders from API:', error)
    }
  }

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      let updated
      if (existing) {
        updated = prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        )
      } else {
        updated = [...prev, { ...product, qty }]
      }
      persistCart(updated)
      return updated
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== productId)
      persistCart(updated)
      return updated
    })
  }

  const updateQty = (productId, newQty) => {
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.id === productId ? { ...item, qty: Math.max(1, newQty) } : item
      )
      persistCart(updated)
      return updated
    })
  }

  const clearCart = () => {
    setCartItems([])
    persistCart([])
  }

  const resetSession = async () => {
    setCartItems([])
    setAddress('')
    setAddressId(null)
    setAddresses([])
    setOrders([])
    setRestaurants([])
    setPaymentMethod('Pix')
    try {
      await SecureStore.deleteItemAsync('cartItems')
      await SecureStore.deleteItemAsync('userAddress')
      await SecureStore.deleteItemAsync('userOrders')
      await SecureStore.deleteItemAsync('userPaymentMethod')
      await SecureStore.deleteItemAsync('orderReceipts')
    } catch (err) {
      console.warn('Reset session storage error:', err)
    }
  }

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true)
    try {
      const list = await fetchUserAddresses()
      const arr = Array.isArray(list) ? list : []
      setAddresses(arr)
      setAddressId(prevId => {
        const stillValid = prevId && arr.find(a => a.id === prevId)
        if (stillValid) return prevId
        if (arr.length > 0) {
          const def = arr.find(a => a.isDefault) || arr[0]
          const formatted = formatAddress(def)
          setAddress(formatted)
          persistAddress(formatted)
          return def.id
        }
        setAddress('')
        SecureStore.deleteItemAsync('userAddress').catch(() => {})
        return null
      })
      return arr
    } finally {
      setLoadingAddresses(false)
    }
  }, [])

  const selectAddress = (id) => {
    const found = addresses.find(a => a.id === id)
    if (!found) return
    setAddressId(found.id)
    const formatted = formatAddress(found)
    setAddress(formatted)
    persistAddress(formatted)
  }

  const addAddress = async ({ street, city, state, zipCode, isDefault = true, latitude = 0, longitude = 0 }) => {
    const created = await createUserAddress({ street, city, state, zipCode, isDefault, latitude, longitude })
    if (created && created.id) {
      setAddresses(prev => {
        const filtered = isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev
        return [...filtered, created]
      })
      setAddressId(created.id)
      const formatted = formatAddress(created)
      setAddress(formatted)
      persistAddress(formatted)
    }
    return created
  }

  const updateAddress = async (newAddress) => {
    setAddress(newAddress)
    persistAddress(newAddress)
  }

  const updatePaymentMethod = (method) => {
    setPaymentMethod(method)
    persistPaymentMethod(method)
  }

  const placeOrder = async (restaurantId, deliveryAddressId, items, options = {}) => {
    const finalAddressId = deliveryAddressId || addressId
    if (!finalAddressId) {
      throw new Error('Nenhum endereço de entrega cadastrado. Cadastre um endereço para continuar.')
    }

    const backendItems = items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty
    }))

    const response = await createOrder({
      restaurantId: restaurantId || 1,
      deliveryAddressId: finalAddressId,
      items: backendItems,
      paymentMethod: mapPaymentMethod(paymentMethod),
      couponCode: options.couponCode,
    })

    if (response && response.id) {
      try {
        const savedReceipts = await SecureStore.getItemAsync('orderReceipts')
        const receiptsObj = savedReceipts ? JSON.parse(savedReceipts) : {}
        receiptsObj[response.id] = {
          paymentMethod,
          address
        }
        await SecureStore.setItemAsync('orderReceipts', JSON.stringify(receiptsObj))
      } catch (err) {
        console.error('Error saving order receipt details:', err)
      }
    }

    return response
  }

  const confirmPayment = async (orderId) => {
    let email = ''
    try {
      const profile = await fetchUserProfile()
      email = profile.email
    } catch (err) {
      console.error('Failed to fetch user email for checkout:', err)
      throw new Error('Não foi possível obter os dados do usuário para pagamento.')
    }

    return await createCheckout({
      orderId,
      method: mapPaymentMethod(paymentMethod),
      customerEmail: email,
    })
  }

  const approvePayment = async (orderId) => {
    return await markOrderPaid(orderId)
  }

  const cancelPendingOrder = async (orderId) => {
    return await cancelOrder(orderId)
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      address,
      addressId,
      addresses,
      loadingAddresses,
      orders,
      paymentMethod,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      updateAddress,
      loadAddresses,
      selectAddress,
      addAddress,
      updatePaymentMethod,
      placeOrder,
      confirmPayment,
      approvePayment,
      cancelPendingOrder,
      loadOrders,
      resetSession,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
