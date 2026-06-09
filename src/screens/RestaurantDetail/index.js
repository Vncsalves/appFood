import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, FlatList
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { colors, fonts } from '../../constants'
import { fetchProducts } from '../../services/api'

function ProductCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={item.image} style={styles.productImg} resizeMode="cover" />
      {item.badge && (
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>{item.badge}</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>{item.price}</Text>
          {item.oldPrice && <Text style={styles.productOldPrice}>{item.oldPrice}</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.productAddBtn} onPress={onPress}>
        <Ionicons name="add" size={18} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default function RestaurantDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { restaurant } = route.params || {}

  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!restaurant?.id) return

    async function loadProducts() {
      try {
        setIsLoading(true)
        const productsData = await fetchProducts(restaurant.id)
        
        const mappedProducts = productsData.map((p, index) => {
          const formattedPrice = `R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}`
          return {
            id: p.id,
            name: p.name,
            price: formattedPrice,
            oldPrice: index % 2 === 0 ? `R$ ${(parseFloat(p.price) * 1.2).toFixed(2).replace('.', ',')}` : null,
            image: p.image && p.image.startsWith('data:image') 
              ? { uri: p.image } 
              : { uri: p.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
            badge: index % 2 === 0 ? 'OFERTA' : null,
            description: p.description || '',
            store: restaurant.name
          }
        })
        setProducts(mappedProducts)
      } catch (err) {
        console.error('Failed to load products for restaurant:', err)
        setError('Não foi possível carregar os produtos do cardápio.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [restaurant])

  const goToProduct = (product) => navigation.navigate('ProductDetail', { product })

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Restaurante não encontrado.</Text>
          <TouchableOpacity style={styles.backBtnText} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.imageWrap}>
          <Image source={restaurant.image} style={styles.image} resizeMode="cover" />
          <SafeAreaView style={styles.imageOverlay} edges={['top']}>
            <TouchableOpacity style={styles.backIconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.restaurantCard}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <View style={[styles.statusBadge, restaurant.isOpen ? styles.statusOpen : styles.statusClosed]}>
                <Text style={styles.statusText}>{restaurant.isOpen ? 'Aberto' : 'Fechado'}</Text>
              </View>
            </View>
            <Text style={styles.category}>{restaurant.category}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.metaText}>{restaurant.rating}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>{restaurant.time}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="bicycle-outline" size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>{restaurant.fee === 'Grátis' ? 'Grátis' : restaurant.fee}</Text>
              </View>
            </View>
          </View>

          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Cardápio</Text>

            {isLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando cardápio...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="fast-food-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>Nenhum produto cadastrado neste restaurante.</Text>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                numColumns={2}
                columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
                renderItem={({ item }) => (
                  <View style={{ flex: 1 }}>
                    <ProductCard item={item} onPress={() => goToProduct(item)} />
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
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
    height: 200,
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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backIconBtn: {
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  restaurantCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusOpen: {
    backgroundColor: '#E8F5E9',
  },
  statusClosed: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weight.bold,
    color: '#2E7D32',
  },
  category: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
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
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
  },
  productsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImg: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border,
  },
  productBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productBadgeText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weight.bold,
    letterSpacing: 0.3,
  },
  productInfo: {
    padding: 12,
    paddingRight: 40,
  },
  productName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productPrice: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  productOldPrice: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  productAddBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    fontWeight: fonts.weight.medium,
  },
  errorText: {
    fontSize: fonts.sizes.md,
    color: '#D32F2F',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  backBtnText: {
    marginTop: 8,
    padding: 8,
  },
})
