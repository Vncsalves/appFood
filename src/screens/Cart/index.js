import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Modal, TextInput, Alert,
  ActivityIndicator, Linking
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { colors, fonts } from '../../constants'
import { useCart, getDeliveryFeeForRestaurant } from '../../context/CartContext'
import { fetchCoupons } from '../../services/api'

const initialItems = [
  { id: 1, image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' }, name: 'Pizza margherita', store: 'Pizzaria Roma', price: 45, qty: 1 },
  { id: 2, image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }, name: 'Burger clássico', store: 'Burger House', price: 28, qty: 2 },
  { id: 3, image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400' }, name: 'Bowl de açaí', store: 'Açaí da Praça', price: 22, qty: 1 },
]

function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function CartItem({ item, onInc, onDec, onRemove }) {
  return (
    <View style={styles.itemCard}>
      <Image source={item.image} style={styles.itemImg} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <View style={styles.itemTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemStore}>{item.store}</Text>
          </View>
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="trash-outline" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        <View style={styles.itemBottom}>
          <Text style={styles.itemPrice}>{formatBRL(item.price * item.qty)}</Text>
          <View style={styles.qtyBox}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDec}>
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onInc}>
              <Ionicons name="add" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default function CartScreen() {
  const navigation = useNavigation()
  const {
    cartItems,
    address,
    addressId,
    addresses,
    loadingAddresses,
    loadAddresses,
    selectAddress,
    addAddress,
    updateQty,
    removeFromCart,
    clearCart,
    placeOrder,
    confirmPayment,
    approvePayment,
    cancelPendingOrder,
    loadOrders,
    paymentMethod,
    updatePaymentMethod
  } = useCart()

  const [addressOpen, setAddressOpen] = useState(false)
  const [newAddressOpen, setNewAddressOpen] = useState(false)
  const [newAddressDraft, setNewAddressDraft] = useState({
    street: '', city: '', state: '', zipCode: '',
  })
  const [savingAddress, setSavingAddress] = useState(false)
  const [couponOpen, setCouponOpen] = useState(false)
  const [coupon, setCoupon] = useState(null)
  const [success, setSuccess] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [pendingOrderId, setPendingOrderId] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0)
  const currentRestaurantId = cartItems[0]?.restaurantId || 1
  const baseDelivery = cartItems.length > 0 ? getDeliveryFeeForRestaurant(currentRestaurantId) : 0

  useFocusEffect(useCallback(() => {
    loadAddresses().catch(() => {})
  }, [loadAddresses]))

  useEffect(() => {
    async function loadCoupons() {
      if (cartItems.length === 0) return
      setLoadingCoupons(true)
      try {
        const data = await fetchCoupons(currentRestaurantId)
        const now = new Date()
        const activeCoupons = data.filter(c => {
          const isDbActive = c.isActive === true || c.isActive === 'true' || c.isActive === 1
          const isNotExpired = c.expiresAt ? new Date(c.expiresAt) > now : true
          return isDbActive && isNotExpired
        })
        setCoupons(activeCoupons)
      } catch (err) {
        console.error('Error loading coupons:', err)
      } finally {
        setLoadingCoupons(false)
      }
    }
    loadCoupons()
  }, [currentRestaurantId, cartItems.length])

  useEffect(() => {
    if (coupon) {
      const minVal = parseFloat(coupon.min) || 0
      if (subtotal < minVal) {
        setCoupon(null)
      }
    }
  }, [subtotal, coupon])

  let discount = 0
  let deliveryFee = baseDelivery
  if (coupon) {
    const minVal = parseFloat(coupon.min) || 0
    if (subtotal >= minVal) {
      const couponVal = parseFloat(coupon.value) || 0
      if (coupon.type === 'percent') {
        discount = subtotal * (couponVal / 100)
      } else {
        discount = couponVal
      }
    }
  }
  const total = Math.max(0, subtotal + deliveryFee - discount)

  const applyCoupon = (c) => {
    const minVal = parseFloat(c.min) || 0
    if (subtotal < minVal) return
    setCoupon(c)
    setCouponOpen(false)
  }

  const openAddressPicker = () => {
    loadAddresses().catch(() => {})
    setAddressOpen(true)
  }

  const handleSelectAddress = (id) => {
    selectAddress(id)
    setAddressOpen(false)
  }

  const handleSaveNewAddress = async () => {
    const street = newAddressDraft.street.trim()
    const city = newAddressDraft.city.trim()
    const state = newAddressDraft.state.trim().toUpperCase()
    const zipCode = newAddressDraft.zipCode.trim()
    if (!street || !city || !state || !zipCode) {
      Alert.alert('Campos obrigatórios', 'Preencha rua, cidade, estado e CEP.')
      return
    }
    setSavingAddress(true)
    try {
      await addAddress({ street, city, state, zipCode, isDefault: addresses.length === 0 })
      setNewAddressDraft({ street: '', city: '', state: '', zipCode: '' })
      setNewAddressOpen(false)
      setAddressOpen(false)
    } catch (err) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar o endereço.')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleCheckout = () => {
    if (processing) return
    if (!addressId) {
      Alert.alert(
        'Endereço necessário',
        'Cadastre um endereço de entrega antes de finalizar o pedido.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cadastrar agora', onPress: () => setNewAddressOpen(true) },
        ]
      )
      return
    }
    setReviewOpen(true)
  }

  const handleConfirmOrder = async () => {
    if (processing) return
    setProcessing(true)
    try {
      const order = await placeOrder(
        cartItems[0]?.restaurantId || 1,
        addressId,
        cartItems,
        { couponCode: coupon?.code }
      )

      if (!order || !order.id) {
        throw new Error('Pedido criado sem ID. Tente novamente.')
      }

      setPendingOrderId(order.id)

      const payment = await confirmPayment(order.id)
      setPaymentInfo(payment || {})
      setReviewOpen(false)
      setPaymentConfirmOpen(true)
    } catch (error) {
      console.error('Checkout error:', error)
      Alert.alert(
        'Erro ao processar pedido',
        error.message || 'Houve um problema ao processar seu pedido.'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelPayment = async () => {
    if (cancelling) return
    setCancelling(true)
    try {
      if (pendingOrderId) {
        try {
          await cancelPendingOrder(pendingOrderId)
        } catch (err) {
          console.warn('Failed to cancel pending order:', err.message)
        }
      }
      await loadOrders().catch(() => {})
    } finally {
      setPaymentConfirmOpen(false)
      setPaymentInfo(null)
      setPendingOrderId(null)
      setCancelling(false)
    }
  }

  const handlePaymentConfirmed = async () => {
    try {
      if (pendingOrderId) {
        try {
          await approvePayment(pendingOrderId)
        } catch (err) {
          console.warn('Webhook approval failed (may still update via gateway):', err.message)
        }
      }
      await loadOrders()
      clearCart()
      setCoupon(null)
      setPaymentConfirmOpen(false)
      setPaymentInfo(null)
      setPendingOrderId(null)
      setSuccess(true)
    } catch (error) {
      console.error('Error finalizing order:', error)
      Alert.alert('Erro', error.message || 'Não foi possível concluir o pedido.')
    }
  }

  const goToOrders = () => {
    setSuccess(false)
    navigation.navigate('Orders')
  }

  const openPaymentLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) await Linking.openURL(url)
      else Alert.alert('Erro', 'Não foi possível abrir o link de pagamento.')
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível abrir o link de pagamento.')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Carrinho</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
          <Text style={styles.emptyText}>Adicione produtos para começar seu pedido</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreBtnText}>Explorar produtos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <TouchableOpacity style={[styles.addressBox, { marginBottom: 12 }]} onPress={openAddressPicker}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>Entregar em</Text>
                <Text style={styles.addressText}>{address || 'Selecionar endereço'}</Text>
              </View>
              <Text style={styles.addressChange}>{address ? 'Trocar' : 'Adicionar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentBox} onPress={() => setPaymentOpen(true)}>
              <Ionicons name={paymentMethod === 'Pix' ? 'qr-code-outline' : paymentMethod === 'Dinheiro' ? 'cash-outline' : 'card-outline'} size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentLabel}>Forma de pagamento</Text>
                <Text style={styles.paymentText}>{paymentMethod}</Text>
              </View>
              <Text style={styles.paymentChange}>Trocar</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Itens ({cartItems.length})</Text>
            {cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onInc={() => updateQty(item.id, item.qty + 1)}
                onDec={() => updateQty(item.id, item.qty - 1)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}

            <TouchableOpacity style={styles.couponBox} onPress={() => setCouponOpen(true)}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                {coupon ? (
                  <>
                    <Text style={styles.couponText}>{coupon.code}</Text>
                    <Text style={styles.couponSub}>
                      {coupon.type === 'percent' 
                        ? `${parseFloat(coupon.value)}% OFF` 
                        : `R$ ${parseFloat(coupon.value).toFixed(2).replace('.', ',')} OFF`} aplicado
                    </Text>
                  </>
                ) : (
                  <Text style={styles.couponText}>Aplicar cupom</Text>
                )}
              </View>
              {coupon && (
                <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); setCoupon(null) }}>
                  <Ionicons name="close-circle" size={18} color={colors.textLight} />
                </TouchableOpacity>
              )}
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.summary}>
              <Text style={styles.sectionTitle}>Resumo</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatBRL(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de entrega</Text>
                <Text style={styles.summaryValue}>{formatBRL(deliveryFee)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.primary }]}>Desconto</Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>- {formatBRL(discount)}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatBRL(total)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.checkoutBtn, processing && { opacity: 0.7 }]}
              onPress={handleCheckout}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.checkoutText}>Finalizar pedido</Text>
                  <Text style={styles.checkoutTotal}>{formatBRL(total)}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal transparent animationType="slide" visible={addressOpen} onRequestClose={() => setAddressOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Endereço de entrega</Text>
              <TouchableOpacity onPress={() => setAddressOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              {loadingAddresses ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : addresses.length === 0 ? (
                <Text style={styles.noCouponsText}>Nenhum endereço cadastrado.</Text>
              ) : (
                addresses.map(a => {
                  const selected = a.id === addressId
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.couponItem, selected && { borderWidth: 1, borderColor: colors.primary }]}
                      onPress={() => handleSelectAddress(a.id)}
                    >
                      <View style={styles.couponIcon}>
                        <Ionicons name="location" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.couponCode}>{a.street}</Text>
                        <Text style={styles.couponDesc}>
                          {a.city} - {a.state} · {a.zipCode}{a.isDefault ? ' · Padrão' : ''}
                        </Text>
                      </View>
                      {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                    </TouchableOpacity>
                  )
                })
              )}
              <TouchableOpacity
                style={[styles.modalBtn, { marginTop: 8 }]}
                onPress={() => { setAddressOpen(false); setNewAddressOpen(true) }}
              >
                <Text style={styles.modalBtnText}>Cadastrar novo endereço</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={newAddressOpen} onRequestClose={() => setNewAddressOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo endereço</Text>
              <TouchableOpacity onPress={() => setNewAddressOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              <Text style={styles.inputLabel}>Rua e número</Text>
              <TextInput
                style={styles.addrInput}
                value={newAddressDraft.street}
                onChangeText={t => setNewAddressDraft(d => ({ ...d, street: t }))}
                placeholder="Rua das Flores, 123"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputLabel}>Cidade</Text>
              <TextInput
                style={styles.addrInput}
                value={newAddressDraft.city}
                onChangeText={t => setNewAddressDraft(d => ({ ...d, city: t }))}
                placeholder="São Paulo"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputLabel}>Estado (UF)</Text>
              <TextInput
                style={styles.addrInput}
                value={newAddressDraft.state}
                onChangeText={t => setNewAddressDraft(d => ({ ...d, state: t.toUpperCase().slice(0, 2) }))}
                placeholder="SP"
                placeholderTextColor={colors.textLight}
                maxLength={2}
                autoCapitalize="characters"
              />
              <Text style={styles.inputLabel}>CEP</Text>
              <TextInput
                style={styles.addrInput}
                value={newAddressDraft.zipCode}
                onChangeText={t => setNewAddressDraft(d => ({ ...d, zipCode: t }))}
                placeholder="01001-000"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.modalBtn, savingAddress && { opacity: 0.7 }]}
                onPress={handleSaveNewAddress}
                disabled={savingAddress}
              >
                {savingAddress ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalBtnText}>Salvar endereço</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={couponOpen} onRequestClose={() => setCouponOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cupons disponíveis</Text>
              <TouchableOpacity onPress={() => setCouponOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {loadingCoupons ? (
                <Text style={styles.loadingText}>Carregando cupons...</Text>
              ) : coupons.length === 0 ? (
                <Text style={styles.noCouponsText}>Nenhum cupom disponível no momento</Text>
              ) : (
                coupons.map(c => {
                  const minVal = parseFloat(c.min) || 0
                  const valNum = parseFloat(c.value) || 0
                  const disabled = subtotal < minVal
                  const label = c.type === 'percent' ? `${valNum}% OFF` : `R$ ${valNum.toFixed(2).replace('.', ',')} OFF`
                  
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.couponItem, disabled && { opacity: 0.4 }]}
                      onPress={() => applyCoupon(c)}
                      disabled={disabled}
                    >
                      <View style={styles.couponIcon}>
                        <Ionicons name="pricetag" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.couponCode}>{c.code}</Text>
                        <Text style={styles.couponDesc}>
                          {label}{minVal > 0 && ` · Mín. ${formatBRL(minVal)}`}
                        </Text>
                      </View>
                      {coupon?.id === c.id && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  )
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={paymentOpen} onRequestClose={() => setPaymentOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Forma de pagamento</Text>
              <TouchableOpacity onPress={() => setPaymentOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {[
              { id: 'Pix', label: 'Pix', icon: 'qr-code-outline' },
              { id: 'Cartão de Crédito', label: 'Cartão de Crédito', icon: 'card-outline' },
              { id: 'Cartão de Débito', label: 'Cartão de Débito', icon: 'card-outline' },
              { id: 'Dinheiro', label: 'Dinheiro', icon: 'cash-outline' },
            ].map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.paymentItem}
                onPress={() => {
                  updatePaymentMethod(p.id)
                  setPaymentOpen(false)
                }}
              >
                <View style={styles.paymentItemIcon}>
                  <Ionicons name={p.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.paymentItemLabel}>{p.label}</Text>
                {paymentMethod === p.id && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={paymentConfirmOpen} onRequestClose={() => {}}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar pagamento</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              <View style={styles.paymentSummary}>
                <Text style={styles.paymentSummaryLabel}>Pedido #{pendingOrderId}</Text>
                <Text style={styles.paymentSummaryValue}>{formatBRL(total)}</Text>
              </View>
              <View style={styles.paymentSummaryRow}>
                <Ionicons name={paymentMethod === 'Pix' ? 'qr-code-outline' : paymentMethod === 'Dinheiro' ? 'cash-outline' : 'card-outline'} size={20} color={colors.primary} />
                <Text style={styles.paymentMethodLabel}>{paymentMethod}</Text>
              </View>

              {paymentInfo?.qrCodeBase64 ? (
                <View style={styles.qrBox}>
                  <Image
                    source={{ uri: paymentInfo.qrCodeBase64.startsWith('data:') ? paymentInfo.qrCodeBase64 : `data:image/png;base64,${paymentInfo.qrCodeBase64}` }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
              ) : paymentInfo?.qrCode ? (
                <View style={styles.qrBox}>
                  <Image source={{ uri: paymentInfo.qrCode }} style={styles.qrImage} resizeMode="contain" />
                </View>
              ) : null}

              {paymentInfo?.qrCodeText || paymentInfo?.copyPaste ? (
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>Código PIX (copia e cola)</Text>
                  <Text style={styles.codeText} numberOfLines={4}>
                    {paymentInfo.qrCodeText || paymentInfo.copyPaste}
                  </Text>
                </View>
              ) : null}

              {paymentInfo?.paymentLink || paymentInfo?.checkoutUrl || paymentInfo?.url ? (
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => openPaymentLink(paymentInfo.paymentLink || paymentInfo.checkoutUrl || paymentInfo.url)}
                >
                  <Ionicons name="open-outline" size={18} color={colors.white} />
                  <Text style={styles.linkBtnText}>Abrir página de pagamento</Text>
                </TouchableOpacity>
              ) : null}

              {paymentMethod === 'Dinheiro' && !paymentInfo?.qrCode && !paymentInfo?.qrCodeBase64 && !paymentInfo?.paymentLink ? (
                <Text style={styles.paymentHint}>
                  Pague em dinheiro ao receber o pedido.
                </Text>
              ) : null}

              <Text style={styles.paymentInstructions}>
                Após realizar o pagamento, confirme abaixo para enviarmos o pedido ao restaurante.
              </Text>

              <TouchableOpacity style={styles.modalBtn} onPress={handlePaymentConfirmed}>
                <Text style={styles.modalBtnText}>Já paguei</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost, { marginTop: 8 }, cancelling && { opacity: 0.7 }]}
                onPress={handleCancelPayment}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.modalBtnGhostText}>Cancelar pedido</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={reviewOpen} onRequestClose={() => !processing && setReviewOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Revisar pedido</Text>
              <TouchableOpacity onPress={() => !processing && setReviewOpen(false)} disabled={processing}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              <View style={styles.paymentSummary}>
                <Text style={styles.paymentSummaryLabel}>Total</Text>
                <Text style={styles.paymentSummaryValue}>{formatBRL(total)}</Text>
              </View>

              <TouchableOpacity style={[styles.paymentItem, { marginBottom: 10 }]} onPress={() => setPaymentOpen(true)} disabled={processing}>
                <View style={styles.paymentItemIcon}>
                  <Ionicons name={paymentMethod === 'Pix' ? 'qr-code-outline' : paymentMethod === 'Dinheiro' ? 'cash-outline' : 'card-outline'} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentLabel}>Forma de pagamento</Text>
                  <Text style={styles.paymentText}>{paymentMethod}</Text>
                </View>
                <Text style={styles.paymentChange}>Trocar</Text>
              </TouchableOpacity>

              <View style={[styles.paymentItem, { marginBottom: 10 }]}>
                <View style={styles.paymentItemIcon}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentLabel}>Entregar em</Text>
                  <Text style={styles.paymentText} numberOfLines={2}>{address}</Text>
                </View>
              </View>

              <Text style={styles.paymentInstructions}>
                Ao confirmar, seu pedido será enviado ao restaurante e o pagamento iniciado.
              </Text>

              <TouchableOpacity
                style={[styles.modalBtn, processing && { opacity: 0.7 }]}
                onPress={handleConfirmOrder}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalBtnText}>Confirmar e pagar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost, { marginTop: 8 }]}
                onPress={() => setReviewOpen(false)}
                disabled={processing}
              >
                <Text style={styles.modalBtnGhostText}>Voltar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={success} onRequestClose={() => setSuccess(false)}>
        <View style={styles.successBg}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>Pedido confirmado!</Text>
            <Text style={styles.successText}>
              Seu pagamento foi aprovado e seu pedido foi enviado ao restaurante.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={goToOrders}>
              <Text style={styles.modalBtnText}>Acompanhar pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  exploreBtnText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.white,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addressLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted },
  addressText: { fontSize: fonts.sizes.md, color: colors.textPrimary, fontWeight: fonts.weight.medium },
  addressChange: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: fonts.weight.medium },
  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  paymentLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted },
  paymentText: { fontSize: fonts.sizes.md, color: colors.textPrimary, fontWeight: fonts.weight.medium },
  paymentChange: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: fonts.weight.medium },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentItemLabel: {
    flex: 1,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemImg: { width: 90, height: 90, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  itemInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  itemTop: { flexDirection: 'row', alignItems: 'flex-start' },
  itemName: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.medium, color: colors.textPrimary },
  itemStore: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemPrice: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.medium, color: colors.primary },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    minWidth: 14,
    textAlign: 'center',
  },
  couponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primaryLight,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  couponText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  couponSub: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
  summary: { marginTop: 8 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  summaryLabel: { fontSize: fonts.sizes.md, color: colors.textMuted },
  summaryValue: { fontSize: fonts.sizes.md, color: colors.textPrimary },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  totalLabel: { fontSize: fonts.sizes.lg, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  totalValue: { fontSize: fonts.sizes.lg, fontWeight: fonts.weight.bold, color: colors.primary },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
  },
  checkoutText: { fontSize: fonts.sizes.lg, fontWeight: fonts.weight.bold, color: colors.white },
  checkoutTotal: { fontSize: fonts.sizes.lg, fontWeight: fonts.weight.bold, color: colors.white },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: fonts.sizes.xl, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  modalBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalBtnText: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.bold, color: colors.white },
  modalBtnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  modalBtnGhostText: {
    fontSize: fonts.sizes.md, fontWeight: fonts.weight.bold, color: colors.primary,
  },
  addressInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 14,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 6,
  },
  addrInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 14,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  couponItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  couponIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCode: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  couponDesc: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
  successBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: { marginBottom: 8 },
  successTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginTop: 8,
  },
  successText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  loadingText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
  noCouponsText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentSummaryLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    fontWeight: fonts.weight.medium,
  },
  paymentSummaryValue: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  paymentMethodLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  qrBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  codeBox: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  codeLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 14,
  },
  linkBtnText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.white,
  },
  paymentHint: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    textAlign: 'center',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  paymentInstructions: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
})
