import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { colors, fonts } from '../../constants'
import { useCart } from '../../context/CartContext'

const defaultProduct = {
  image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800' },
  name: 'Pizza margherita',
  store: 'Pizzaria Roma',
  rating: 4.7,
  reviews: 410,
  prepTime: '30-45 min',
  price: 45,
  description: 'Massa artesanal fina e crocante, com molho de tomate italiano, mussarela de búfala, folhas de manjericão fresco e fio de azeite extra virgem. Receita tradicional napolitana assada em forno a lenha.',
}

function parsePrice(p) {
  if (typeof p === 'number') return p
  if (typeof p === 'string') return parseFloat(p.replace('R$ ', '').replace(',', '.')) || 0
  return 0
}



function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export default function ProductDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const passed = route.params?.product
  const product = passed ? {
    ...defaultProduct,
    ...passed,
    store: passed.store || defaultProduct.store,
    description: passed.description || defaultProduct.description,
    price: parsePrice(passed.price),
    rating: passed.rating ?? defaultProduct.rating,
    reviews: passed.reviews ?? defaultProduct.reviews,
  } : defaultProduct

  const [qty, setQty] = useState(1)
  const [favorited, setFavorited] = useState(false)
  const { addToCart: addItem } = useCart()

  const total = product.price * qty

  const addToCart = () => {
    addItem(product, qty)
    Alert.alert(
      'Adicionado ao carrinho',
      `${qty}× ${product.name}\nTotal: ${formatBRL(total)}`,
      [
        { text: 'Continuar comprando', style: 'cancel' },
        { text: 'Ver carrinho', onPress: () => navigation.navigate('Tabs', { screen: 'Cart' }) },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.imageWrap}>
          <Image source={product.image} style={styles.image} resizeMode="cover" />
          <SafeAreaView style={styles.imageOverlay} edges={['top']}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setFavorited(!favorited)}>
                <Ionicons
                  name={favorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={favorited ? colors.primary : colors.textPrimary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => Alert.alert('Compartilhar', `Confira ${product.name} no Dentu!`)}
              >
                <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.store}>{product.store}</Text>
            </View>
            <Text style={styles.price}>{formatBRL(product.price)}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.metaText}>{product.rating}</Text>
              <Text style={styles.metaSub}>({product.reviews})</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{product.prepTime}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>Grátis</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.qtyBox}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty(Math.max(1, qty - 1))}
          >
            <Ionicons name="remove" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty(qty + 1)}
          >
            <Ionicons name="add" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addToCart}>
          <Text style={styles.addBtnText}>Adicionar</Text>
          <Text style={styles.addBtnPrice}>{formatBRL(total)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageWrap: {
    width: '100%',
    height: 280,
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  name: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  store: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    marginTop: 2,
  },
  price: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  metaSub: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    lineHeight: 22,
  },
  extrasList: {
    marginTop: 4,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  extraName: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  extraPrice: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    fontWeight: fonts.weight.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 4,
    gap: 8,
    height: 52,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.white,
  },
  addBtnPrice: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.white,
  },
})
