import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Modal, TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { colors, fonts } from '../../constants'

const initialItems = [
  { id: 1, image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' }, name: 'Pizza margherita', store: 'Pizzaria Roma', price: 45, qty: 1 },
  { id: 2, image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }, name: 'Burger clássico', store: 'Burger House', price: 28, qty: 2 },
  { id: 3, image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400' }, name: 'Bowl de açaí', store: 'Açaí da Praça', price: 22, qty: 1 },
]

const coupons = [
  { code: 'DENTU10', label: '10% OFF', discount: 0.10, min: 0 },
  { code: 'FRETE0', label: 'Frete grátis', discount: 0, freeShipping: true, min: 30 },
  { code: 'BEMVINDO', label: 'R$ 15 OFF', flatDiscount: 15, min: 50 },
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
  const [items, setItems] = useState(initialItems)
  const [address, setAddress] = useState('Rua das Flores, 123 — Centro')
  const [addressOpen, setAddressOpen] = useState(false)
  const [addressDraft, setAddressDraft] = useState(address)
  const [couponOpen, setCouponOpen] = useState(false)
  const [coupon, setCoupon] = useState(null)
  const [success, setSuccess] = useState(false)

  const inc = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))
  const dec = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0)
  const baseDelivery = items.length > 0 ? 7.9 : 0

  let discount = 0
  let deliveryFee = baseDelivery
  if (coupon && subtotal >= coupon.min) {
    if (coupon.freeShipping) deliveryFee = 0
    if (coupon.discount) discount = subtotal * coupon.discount
    if (coupon.flatDiscount) discount = coupon.flatDiscount
  }
  const total = subtotal + deliveryFee - discount

  const applyCoupon = (c) => {
    if (subtotal < c.min) return
    setCoupon(c)
    setCouponOpen(false)
  }

  const saveAddress = () => {
    if (addressDraft.trim()) {
      setAddress(addressDraft.trim())
    }
    setAddressOpen(false)
  }

  const checkout = () => setSuccess(true)

  const finishCheckout = () => {
    setItems([])
    setCoupon(null)
    setSuccess(false)
    navigation.navigate('Orders')
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

      {items.length === 0 ? (
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
            <TouchableOpacity style={styles.addressBox} onPress={() => { setAddressDraft(address); setAddressOpen(true) }}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>Entregar em</Text>
                <Text style={styles.addressText}>{address}</Text>
              </View>
              <Text style={styles.addressChange}>Trocar</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Itens ({items.length})</Text>
            {items.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onInc={() => inc(item.id)}
                onDec={() => dec(item.id)}
                onRemove={() => remove(item.id)}
              />
            ))}

            <TouchableOpacity style={styles.couponBox} onPress={() => setCouponOpen(true)}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                {coupon ? (
                  <>
                    <Text style={styles.couponText}>{coupon.code}</Text>
                    <Text style={styles.couponSub}>{coupon.label} aplicado</Text>
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
            <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
              <Text style={styles.checkoutText}>Finalizar pedido</Text>
              <Text style={styles.checkoutTotal}>{formatBRL(total)}</Text>
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
            <TextInput
              style={styles.addressInput}
              value={addressDraft}
              onChangeText={setAddressDraft}
              placeholder="Rua, número, bairro"
              placeholderTextColor={colors.textLight}
              multiline
            />
            <TouchableOpacity style={styles.modalBtn} onPress={saveAddress}>
              <Text style={styles.modalBtnText}>Salvar endereço</Text>
            </TouchableOpacity>
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
            {coupons.map(c => {
              const disabled = subtotal < c.min
              return (
                <TouchableOpacity
                  key={c.code}
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
                      {c.label}{c.min > 0 && ` · Mín. ${formatBRL(c.min)}`}
                    </Text>
                  </View>
                  {coupon?.code === c.code && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )
            })}
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
              Seu pedido foi enviado e em breve sairá para entrega.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={finishCheckout}>
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
  addressInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 14,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
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
})
