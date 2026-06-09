import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, FlatList, Modal, RefreshControl, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { colors, fonts } from '../../constants'
import { useCart } from '../../context/CartContext'

const tabs = ['Em andamento', 'Concluídos', 'Cancelados']



function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function OrderCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.orderTop}>
        <Image source={item.image} style={styles.orderImg} resizeMode="cover" />
        <View style={styles.orderInfo}>
          <Text style={styles.orderStore}>{item.store}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
            <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.orderDivider} />
      <View style={styles.orderBottom}>
        <View>
          <Text style={styles.orderEta}>{item.eta}</Text>
          <Text style={styles.orderItems}>{item.items} {item.items === 1 ? 'item' : 'itens'} · {formatBRL(item.total)}</Text>
        </View>
        <View style={styles.orderBtn}>
          <Text style={styles.orderBtnText}>Detalhes</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function OrdersScreen() {
  const navigation = useNavigation()
  const { orders, loadOrders } = useCart()
  const [activeTab, setActiveTab] = useState('Em andamento')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await loadOrders()
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const data = orders.filter(o => o.type === activeTab)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={styles.title}>Meus pedidos</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh-outline" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Nenhum pedido aqui</Text>
          <Text style={styles.emptyText}>Quando você fizer um pedido, ele aparece nesta lista</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreBtnText}>Explorar produtos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={i => i.id.toString()}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPress={() => setSelectedOrder(item)}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        />
      )}

      <Modal transparent animationType="slide" visible={selectedOrder !== null} onRequestClose={() => setSelectedOrder(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Pedido</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.detailHeader}>
                  <Image source={selectedOrder.image} style={styles.detailStoreImg} resizeMode="cover" />
                  <View style={styles.detailHeaderInfo}>
                    <Text style={styles.detailStoreName}>{selectedOrder.store}</Text>
                    <Text style={styles.detailOrderId}>Pedido #{selectedOrder.id} · {selectedOrder.date}</Text>
                  </View>
                </View>

                <View style={[styles.detailStatusBox, { borderColor: selectedOrder.statusColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: selectedOrder.statusColor, marginRight: 8 }]} />
                  <Text style={[styles.detailStatusText, { color: selectedOrder.statusColor }]}>
                    {selectedOrder.status} ({selectedOrder.eta})
                  </Text>
                </View>

                <Text style={styles.detailSectionTitle}>Itens</Text>
                <View style={styles.detailCard}>
                  {selectedOrder.itemsList && selectedOrder.itemsList.length > 0 ? (
                    selectedOrder.itemsList.map((item, idx) => (
                      <View key={idx} style={styles.detailItemRow}>
                        <View style={styles.detailItemQtyBox}>
                          <Text style={styles.detailItemQty}>{item.quantity}x</Text>
                        </View>
                        <Text style={styles.detailItemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.detailItemPrice}>{formatBRL(parseFloat(item.price) * item.quantity)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyDetailText}>Sem detalhes dos itens disponíveis</Text>
                  )}
                </View>

                <Text style={styles.detailSectionTitle}>Resumo de Valores</Text>
                <View style={styles.detailCard}>
                  <View style={styles.detailSummaryRow}>
                    <Text style={styles.detailSummaryLabel}>Subtotal</Text>
                    <Text style={styles.detailSummaryValue}>
                      {formatBRL(
                        selectedOrder.itemsList && selectedOrder.itemsList.length > 0
                          ? selectedOrder.itemsList.reduce((acc, i) => acc + parseFloat(i.price) * i.quantity, 0)
                          : selectedOrder.total - (selectedOrder.deliveryFee || 0)
                      )}
                    </Text>
                  </View>
                  <View style={styles.detailSummaryRow}>
                    <Text style={styles.detailSummaryLabel}>Taxa de entrega</Text>
                    <Text style={styles.detailSummaryValue}>
                      {selectedOrder.deliveryFee > 0 ? formatBRL(selectedOrder.deliveryFee) : 'Grátis'}
                    </Text>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailSummaryRow}>
                    <Text style={styles.detailTotalLabel}>Total</Text>
                    <Text style={styles.detailTotalValue}>
                      {formatBRL(selectedOrder.total)}
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryCodeCard}>
                  <Ionicons name="key-outline" size={24} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deliveryCodeLabel}>Código de confirmação</Text>
                    <Text style={styles.deliveryCodeSub}>Informe ao entregador ao receber</Text>
                  </View>
                  <Text style={styles.deliveryCode}>{selectedOrder.deliveryVerificationCode}</Text>
                </View>

                <View style={styles.detailCardRow}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailCardLabel}>Endereço de entrega</Text>
                    <Text style={styles.detailCardValue}>{selectedOrder.address}</Text>
                  </View>
                </View>

                <View style={[styles.detailCardRow, { marginTop: 10 }]}>
                  <Ionicons 
                    name={
                      selectedOrder.paymentMethod === 'Pix' 
                        ? 'qr-code-outline' 
                        : selectedOrder.paymentMethod === 'Dinheiro' 
                        ? 'cash-outline' 
                        : 'card-outline'
                    } 
                    size={20} 
                    color={colors.primary} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailCardLabel}>Forma de pagamento</Text>
                    <Text style={styles.detailCardValue}>{selectedOrder.paymentMethod}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  tabsWrap: {
    height: 44,
  },
  tabsRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    height: 36,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    fontWeight: fonts.weight.medium,
  },
  tabTextActive: {
    color: colors.white,
  },
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
  orderCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  orderTop: {
    flexDirection: 'row',
    gap: 12,
  },
  orderImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  orderStore: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.medium,
  },
  orderDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderEta: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  orderItems: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  orderBtnText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: fonts.weight.medium,
  },
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
    maxHeight: '90%',
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  detailStoreImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  detailHeaderInfo: {
    flex: 1,
  },
  detailStoreName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  detailOrderId: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  detailStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: colors.background,
  },
  detailStatusText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
  },
  detailSectionTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  detailCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  detailItemQtyBox: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  detailItemQty: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: fonts.weight.bold,
  },
  detailItemName: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  detailItemPrice: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  emptyDetailText: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  detailSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailSummaryLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  detailSummaryValue: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  detailTotalLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  detailTotalValue: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  deliveryCodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
  },
  deliveryCodeLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  deliveryCodeSub: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  deliveryCode: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  detailCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
  },
  detailCardLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
  },
  detailCardValue: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
    marginTop: 2,
  },
})
