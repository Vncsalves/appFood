import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Image, FlatList
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts } from '../../constants'

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

const sections = [
  {
    id: 1,
    title: 'Almoço',
    products: [
      { id: 1, image: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }, name: 'Salada Caesar', price: 'R$ 24,00', oldPrice: null, badge: null },
      { id: 2, image: { uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' }, name: 'Picanha grelhada', price: 'R$ 58,00', oldPrice: 'R$ 70,00', badge: 'OFERTA' },
      { id: 3, image: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }, name: 'Bowl de poke', price: 'R$ 38,00', oldPrice: null, badge: null },
      { id: 4, image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' }, name: 'Pizza margherita', price: 'R$ 45,00', oldPrice: null, badge: null },
    ],
  },
  {
    id: 2,
    title: 'Lanche da tarde',
    products: [
      { id: 1, image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }, name: 'Burger clássico', price: 'R$ 28,00', oldPrice: null, badge: null },
      { id: 2, image: { uri: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' }, name: 'Bolo de chocolate', price: 'R$ 32,00', oldPrice: 'R$ 40,00', badge: '20% OFF' },
      { id: 3, image: { uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400' }, name: 'Café especial', price: 'R$ 14,00', oldPrice: null, badge: null },
      { id: 4, image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400' }, name: 'Bowl de açaí', price: 'R$ 22,00', oldPrice: null, badge: 'NOVO' },
    ],
  },
  {
    id: 3,
    title: 'Janta',
    products: [
      { id: 1, image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400' }, name: 'Sushi variado', price: 'R$ 52,00', oldPrice: null, badge: null },
      { id: 2, image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' }, name: 'Pizza quatro queijos', price: 'R$ 49,00', oldPrice: null, badge: null },
      { id: 3, image: { uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' }, name: 'Costela BBQ', price: 'R$ 65,00', oldPrice: 'R$ 80,00', badge: 'OFERTA' },
      { id: 4, image: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }, name: 'Salada mediterrânea', price: 'R$ 26,00', oldPrice: null, badge: null },
    ],
  },
  {
    id: 4,
    title: 'Larica da madrugada',
    products: [
      { id: 1, image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }, name: 'Burger duplo', price: 'R$ 35,00', oldPrice: null, badge: null },
      { id: 2, image: { uri: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400' }, name: 'Sorvete artesanal', price: 'R$ 16,00', oldPrice: null, badge: 'NOVO' },
      { id: 3, image: { uri: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' }, name: 'Fatia de torta', price: 'R$ 18,00', oldPrice: null, badge: null },
      { id: 4, image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400' }, name: 'Açaí 500ml', price: 'R$ 25,00', oldPrice: 'R$ 30,00', badge: '17% OFF' },
    ],
  },
]

const stores = [
  { id: 1, image: { uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' }, name: 'Restaurante do Chef', category: 'Brasileira • Carnes', rating: 4.8, reviews: 320 },
  { id: 2, image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }, name: 'Sushi Zen', category: 'Japonesa • Frutos do mar', rating: 4.9, reviews: 215 },
  { id: 3, image: { uri: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=400' }, name: 'Pizzaria Roma', category: 'Italiana • Pizzas', rating: 4.7, reviews: 410 },
  { id: 4, image: { uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' }, name: 'Burger House', category: 'Americana • Lanches', rating: 4.6, reviews: 180 },
  { id: 5, image: { uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400' }, name: 'Café Aroma', category: 'Café • Doces', rating: 4.5, reviews: 95 },
]

function ProductCard({ item }) {
  return (
    <TouchableOpacity style={styles.prodCard}>
      <Image source={item.image} style={styles.prodImg} resizeMode="cover" />
      {item.badge && (
        <View style={styles.prodBadge}>
          <Text style={styles.prodBadgeText}>{item.badge}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.addBtn}>
        <Ionicons name="add" size={18} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.prodInfo}>
        <Text style={styles.prodName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.prodPriceRow}>
          <Text style={styles.prodPrice}>{item.price}</Text>
          {item.oldPrice && <Text style={styles.prodOldPrice}>{item.oldPrice}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

function StoreCard({ item }) {
  return (
    <TouchableOpacity style={styles.storeCard}>
      <Image source={item.image} style={styles.storeImg} resizeMode="cover" />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeCategory}>{item.category}</Text>
        <View style={styles.storeRatingRow}>
          <Ionicons name="star" size={13} color="#FFB800" />
          <Text style={styles.storeRating}>{item.rating}</Text>
          <Text style={styles.storeReviews}>({item.reviews} avaliações)</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.heartBtn}>
        <Ionicons name="heart-outline" size={20} color={colors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={[colors.primaryLight, colors.white]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topGradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.welcomeLabel}>Welcome Back</Text>
                <Text style={styles.userName}>João Silva</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={colors.textLight} />
              <TextInput
                placeholder="Buscar comida ou restaurante…"
                placeholderTextColor={colors.textLight}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Categorias */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explorar categorias</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.catItem}>
              <View style={styles.catCard}>
                <Image source={cat.image} style={styles.catImage} resizeMode="cover" />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Banner */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerRow}>
          <View style={[styles.banner, { backgroundColor: '#E8F5E2' }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Alimentos frescos{'\n'}todos os dias</Text>
              <Text style={styles.bannerSub}>Corra! Pegue seu cupom</Text>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Eu quero</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1490323914169-4b24b013b885?w=300' }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
          <View style={[styles.banner, { backgroundColor: '#FFF3E0' }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Combos especiais{'\n'}de hoje</Text>
              <Text style={styles.bannerSub}>Até 30% de desconto</Text>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Ver ofertas</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        </ScrollView>

        {/* Seções de produtos */}
        {sections.map(section => (
          <View key={section.id}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={section.products}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.prodRow}
              renderItem={({ item }) => <ProductCard item={item} />}
            />
          </View>
        ))}

        {/* Lojas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Restaurantes perto de você</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {stores.map(store => (
          <StoreCard key={store.id} item={store} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topGradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'transparent',
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
  },
  welcomeLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  userName: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  bellBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 14,
    gap: 8,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
  },
  categoriesRow: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  catItem: {
    alignItems: 'center',
    gap: 8,
  },
  catCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  bannerRow: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  banner: {
    width: 280,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 16,
    gap: 8,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: fonts.sizes.xs,
    color: colors.textMuted,
    marginBottom: 12,
  },
  bannerBtn: {
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  bannerImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  prodRow: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 4,
  },
  prodCard: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  prodImg: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  prodBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  prodBadgeText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weight.medium,
  },
  addBtn: {
    position: 'absolute',
    bottom: 58,
    right: 10,
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodInfo: {
    padding: 10,
  },
  prodName: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  prodPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prodPrice: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  prodOldPrice: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  storeImg: {
    width: 90,
    height: 90,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  storeInfo: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  storeName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  storeCategory: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  storeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  storeRating: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  storeReviews: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
  },
  heartBtn: {
    padding: 12,
  },
})