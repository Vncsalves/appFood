import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, FlatList
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { colors, fonts } from '../../constants'

const tabs = ['Em andamento', 'Concluídos', 'Cancelados']

const orders = {
  'Em andamento': [
    {
      id: 1,
      store: 'Pizzaria Roma',
      image: { uri: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=200' },
      status: 'A caminho',
      eta: 'Chega em 15 min',
      total: 67.90,
      items: 2,
      date: 'Hoje, 19:42',
      statusColor: colors.primary,
    },
    {
      id: 2,
      store: 'Sushi Zen',
      image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200' },
      status: 'Preparando',
      eta: 'Chega em 35 min',
      total: 98.50,
      items: 1,
      date: 'Hoje, 19:10',
      statusColor: '#FFB800',
    },
  ],
  'Concluídos': [
    {
      id: 3,
      store: 'Burger House',
      image: { uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200' },
      status: 'Entregue',
      eta: 'Entregue ontem',
      total: 54.00,
      items: 3,
      date: 'Ontem, 20:15',
      statusColor: '#4CAF50',
    },
    {
      id: 4,
      store: 'Café Aroma',
      image: { uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200' },
      status: 'Entregue',
      eta: 'Entregue há 3 dias',
      total: 32.00,
      items: 2,
      date: '30 mai, 15:20',
      statusColor: '#4CAF50',
    },
    {
      id: 5,
      store: 'Restaurante do Chef',
      image: { uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200' },
      status: 'Entregue',
      eta: 'Entregue há 1 semana',
      total: 125.80,
      items: 4,
      date: '27 mai, 13:00',
      statusColor: '#4CAF50',
    },
  ],
  'Cancelados': [
    {
      id: 6,
      store: 'Açaí da Praça',
      image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200' },
      status: 'Cancelado',
      eta: 'Cancelado pelo cliente',
      total: 22.00,
      items: 1,
      date: '25 mai, 18:45',
      statusColor: '#F44336',
    },
  ],
}

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
  const [activeTab, setActiveTab] = useState('Em andamento')
  const data = orders[activeTab] || []

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus pedidos</Text>
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
              onPress={() => navigation.navigate('ProductDetail', { product: {
                image: item.image,
                name: item.store,
                store: item.store,
                rating: 4.7,
                reviews: 100,
                price: item.total,
              }})}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
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
})
