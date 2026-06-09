import { useState, useMemo, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Image, FlatList, Modal,
  ActivityIndicator, StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { colors, fonts } from '../../constants'
import { fetchRestaurants, fetchProducts, fetchUserProfile } from '../../services/api'

const categories = [
  { id: 1, image: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200' }, label: 'Saladas' },
  { id: 2, image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200' }, label: 'Lanches' },
  { id: 3, image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200' }, label: 'Açaí' },
  { id: 4, image: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' }, label: 'Pokes' },
  { id: 5, image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200' }, label: 'Pizzas' },
  { id: 6, image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200' }, label: 'Japonês' },
  { id: 7, image: { uri: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200' }, label: 'Doces' },
  { id: 8, image: { uri: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200' }, label: 'Sorvetes' },
  { id: 9, image: { uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200' }, label: 'Carnes' },
  { id: 10, image: { uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200' }, label: 'Café' },
]

const sortOptions = ['Relevância', 'Menor preço', 'Maior preço', 'Melhor avaliação']

function PromoCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.promoCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={item.image} style={styles.promoImg} resizeMode="cover" />
      {item.badge && (
        <View style={styles.promoBadge}>
          <Text style={styles.promoBadgeText}>{item.badge}</Text>
        </View>
      )}
      <View style={styles.promoInfo}>
        <Text style={styles.promoName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.promoPriceRow}>
          <Text style={styles.promoPrice}>{item.price}</Text>
          {item.oldPrice && <Text style={styles.promoOldPrice}>{item.oldPrice}</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.promoAddBtn} onPress={onPress}>
        <Ionicons name="add" size={18} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

function StoreCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.storeCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={item.image} style={styles.storeImg} resizeMode="cover" />
      <View style={styles.storeBadge}>
        <Ionicons name="star" size={12} color="#FFB800" />
        <Text style={styles.storeBadgeText}>{item.rating}</Text>
      </View>
      <TouchableOpacity style={styles.storeHeart}>
        <Ionicons name="heart-outline" size={18} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeCategory}>{item.category}</Text>
        <View style={styles.storeMeta}>
          <View style={styles.storeMetaItem}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={styles.storeMetaText}>{item.time}</Text>
          </View>
          <View style={styles.storeMetaDot} />
          <View style={styles.storeMetaItem}>
            <Ionicons name="bicycle-outline" size={13} color={colors.textMuted} />
            <Text style={styles.storeMetaText}>{item.fee}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation()
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState('Relevância')
  const [maxPrice, setMaxPrice] = useState(100)
  const [minRating, setMinRating] = useState(0)

  const [stores, setStores] = useState([])
  const [promos, setPromos] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState({ name: 'Carregando...', photo: '' })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      async function loadProfile() {
        try {
          const profile = await fetchUserProfile()
          setUser({
            name: profile.name,
            photo: profile.photo || ''
          })
        } catch (err) {
          console.log('Error loading profile on focus on Home:', err)
        }
      }
      loadProfile()
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    async function loadApiData() {
      try {
        setIsLoading(true)
        const restaurantsData = await fetchRestaurants()
        
        const mappedStores = restaurantsData.map((r, index) => ({
          id: r.id,
          name: r.name,
          isOpen: r.isOpen,
          image: { uri: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
            'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800'
          ][index % 3] },
          category: ['Brasileira • Carnes', 'Lanches • Fast Food', 'Pizzas • Italiana'][index % 3],
          rating: (4.5 + (index % 5) * 0.1).toFixed(1),
          time: ['30-45 min', '40-55 min', '25-40 min'][index % 3],
          fee: ['Grátis', 'R$ 6,90', 'R$ 4,90'][index % 3]
        }))

        setStores(mappedStores)

        if (restaurantsData.length > 0) {
          const productsData = await fetchProducts(restaurantsData[0].id)
          
          const mappedProducts = productsData.map((p, index) => {
            const formattedPrice = `R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}`
            const matchedStore = restaurantsData.find(r => r.id === p.restaurantId) || restaurantsData[0]
            const storeName = matchedStore ? matchedStore.name : 'E-Dento Food'
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
              store: storeName,
              restaurantId: p.restaurantId || matchedStore.id
            }
          })

          setPromos(mappedProducts.slice(0, 4))
          setAllProducts(mappedProducts)
        }
      } catch (error) {
        console.error('Failed to fetch API data on Home:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadApiData()
  }, [])

  const goToProduct = (product) => navigation.navigate('ProductDetail', { product })
  const goToRestaurant = (restaurant) => navigation.navigate('RestaurantDetail', { restaurant })
  const goToProfile = () => navigation.navigate('Profile')

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    return allProducts.filter(p => p.name.toLowerCase().includes(q))
  }, [query, allProducts])

  const filteredPromos = useMemo(() => {
    return promos.filter(p => {
      const priceNum = parseFloat(p.price.replace('R$ ', '').replace(',', '.'))
      return priceNum <= maxPrice
    })
  }, [maxPrice, promos])

  const filteredStores = useMemo(() => {
    return stores.filter(s => s.rating >= minRating)
  }, [minRating, stores])

  const isSearching = !!filteredProducts

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando dados da API...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={['#FF8B5E', '#FFB99A', '#FFE0D2', colors.white]}
          locations={[0, 0.35, 0.75, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerLeft} onPress={goToProfile} activeOpacity={0.7}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color={colors.textLight} />
                </View>
              )}
              <View>
                <Text style={styles.welcomeLabel}>Welcome Back</Text>
                <Text style={styles.userName}>{user.name}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn} onPress={goToProfile}>
              <Ionicons name="person-outline" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={colors.textLight} />
              <TextInput
                placeholder="Buscar comida ou restaurante…"
                placeholderTextColor={colors.textLight}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
              <Ionicons name="options-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {isSearching ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para "{query}"
              </Text>
            </View>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyResults}>
                <Ionicons name="search-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item, i) => `${item.id}-${i}`}
                scrollEnabled={false}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: 14 }}
                columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
                renderItem={({ item }) => (
                  <View style={{ flex: 1 }}>
                    <PromoCard item={item} onPress={() => goToProduct(item)} />
                  </View>
                )}
              />
            )}
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explorar categorias</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.viewAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catItem}
                  onPress={() => { setQuery(cat.label) }}
                >
                  <View style={styles.catCard}>
                    <Image source={cat.image} style={styles.catImage} resizeMode="cover" />
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity activeOpacity={0.9} style={styles.heroWrap} onPress={() => goToProduct(promos[0])}>
              <LinearGradient
                colors={[colors.primary, '#FF8B5E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroContent}>
                  <View style={styles.heroBadgeRow}>
                    <View style={styles.heroBadge}>
                      <Text style={styles.heroBadgeText}>OFERTA DO DIA</Text>
                    </View>
                  </View>
                  <Text style={styles.heroTitle}>Até 30% OFF{'\n'}em pratos do dia</Text>
                  <Text style={styles.heroSub}>Use cupom DENTU10 no checkout</Text>
                  <View style={styles.heroBtn}>
                    <Text style={styles.heroBtnText}>Pedir agora</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </View>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }}
                  style={styles.heroImg}
                  resizeMode="cover"
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Promoções pra você</Text>
                <Text style={styles.sectionSub}>Selecionados pelo seu gosto</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.viewAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredPromos}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              numColumns={2}
              contentContainerStyle={{ paddingHorizontal: 14 }}
              columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
              renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                  <PromoCard item={item} onPress={() => goToProduct(item)} />
                </View>
              )}
            />

            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Restaurantes em destaque</Text>
                <Text style={styles.sectionSub}>Os melhores perto de você</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.viewAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            {filteredStores.map(store => (
              <StoreCard key={store.id} item={store} onPress={() => goToRestaurant(store)} />
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal transparent animationType="slide" visible={filterOpen} onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Ordenar por</Text>
            <View style={styles.chipsRow}>
              {sortOptions.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, sort === opt && styles.chipActive]}
                  onPress={() => setSort(opt)}
                >
                  <Text style={[styles.chipText, sort === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Preço máximo: R$ {maxPrice}</Text>
            <View style={styles.chipsRow}>
              {[30, 50, 70, 100, 150].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, maxPrice === p && styles.chipActive]}
                  onPress={() => setMaxPrice(p)}
                >
                  <Text style={[styles.chipText, maxPrice === p && styles.chipTextActive]}>R$ {p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Avaliação mínima</Text>
            <View style={styles.chipsRow}>
              {[0, 3, 4, 4.5].map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, minRating === r && styles.chipActive]}
                  onPress={() => setMinRating(r)}
                >
                  <Ionicons name="star" size={12} color={minRating === r ? colors.white : '#FFB800'} />
                  <Text style={[styles.chipText, minRating === r && styles.chipTextActive]}>
                    {r === 0 ? 'Todos' : `${r}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => { setSort('Relevância'); setMaxPrice(100); setMinRating(0) }}
              >
                <Text style={styles.modalBtnGhostText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setFilterOpen(false)}>
                <Text style={styles.modalBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topGradient: {
    paddingBottom: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  welcomeLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.white,
  },
  userName: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  bellBtn: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    gap: 8,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  sectionSub: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  viewAll: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: fonts.weight.medium,
  },
  categoriesRow: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  catItem: { alignItems: 'center', gap: 8 },
  catCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  catImage: { width: '100%', height: '100%' },
  catLabel: { fontSize: fonts.sizes.sm, color: colors.textPrimary, fontWeight: fonts.weight.medium },

  heroWrap: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 160,
  },
  heroContent: {
    flex: 1,
    paddingRight: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: fonts.weight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.white,
    lineHeight: 24,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 14,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  heroImg: {
    width: 110,
    height: 110,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  promoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  promoImg: {
    width: '100%',
    height: 130,
    backgroundColor: colors.border,
  },
  promoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  promoBadgeText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weight.bold,
    letterSpacing: 0.3,
  },
  promoInfo: {
    padding: 12,
    paddingRight: 50,
  },
  promoName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  promoPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promoPrice: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  promoOldPrice: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  promoAddBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  storeCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeImg: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  storeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storeBadgeText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  storeHeart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo: {
    padding: 14,
  },
  storeName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  storeCategory: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  storeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  storeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeMetaText: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  storeMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textLight,
  },

  emptyResults: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textMuted },

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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  filterLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  chipTextActive: {
    color: colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.bold, color: colors.white },
  modalBtnGhost: { backgroundColor: colors.background },
  modalBtnGhostText: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.medium, color: colors.textPrimary },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    fontWeight: fonts.weight.medium,
  },
})
