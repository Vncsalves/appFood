import { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Image, FlatList, Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { colors, fonts } from '../../constants'

const popularCategories = [
  { id: 1, image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200' }, label: 'Lanches' },
  { id: 2, image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200' }, label: 'Pizzas' },
  { id: 3, image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200' }, label: 'Japonês' },
  { id: 4, image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200' }, label: 'Açaí' },
  { id: 5, image: { uri: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200' }, label: 'Doces' },
  { id: 6, image: { uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200' }, label: 'Café' },
]

const allResults = [
  { id: 1, image: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' }, name: 'Pizza margherita', price: 45, store: 'Pizzaria Roma', rating: 4.7 },
  { id: 2, image: { uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }, name: 'Burger clássico', price: 28, store: 'Burger House', rating: 4.6 },
  { id: 3, image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400' }, name: 'Combo sushi 20 peças', price: 89, store: 'Sushi Zen', rating: 4.9 },
  { id: 4, image: { uri: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400' }, name: 'Bowl de açaí', price: 22, store: 'Açaí da Praça', rating: 4.8 },
  { id: 5, image: { uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' }, name: 'Picanha grelhada', price: 58, store: 'Restaurante do Chef', rating: 4.8 },
  { id: 6, image: { uri: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' }, name: 'Bolo de chocolate', price: 32, store: 'Café Aroma', rating: 4.5 },
  { id: 7, image: { uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400' }, name: 'Café especial', price: 14, store: 'Café Aroma', rating: 4.5 },
  { id: 8, image: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }, name: 'Bowl de poke', price: 38, store: 'Poke Bar', rating: 4.7 },
]

const sortOptions = ['Relevância', 'Menor preço', 'Maior preço', 'Melhor avaliação']

function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function ResultCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.resultCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={item.image} style={styles.resultImg} resizeMode="cover" />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.resultStore}>{item.store}</Text>
        <View style={styles.resultBottom}>
          <Text style={styles.resultPrice}>{formatBRL(item.price)}</Text>
          <View style={styles.resultRating}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.resultRatingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function SearchScreen() {
  const navigation = useNavigation()
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState(['Pizza margherita', 'Hambúrguer artesanal', 'Sushi', 'Açaí'])
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState('Relevância')
  const [maxPrice, setMaxPrice] = useState(100)
  const [minRating, setMinRating] = useState(0)

  const filtered = useMemo(() => {
    let list = allResults.filter(r => r.price <= maxPrice && r.rating >= minRating)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.store.toLowerCase().includes(q))
    }
    if (sort === 'Menor preço') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'Maior preço') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'Melhor avaliação') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [query, sort, maxPrice, minRating])

  const goToProduct = (item) => navigation.navigate('ProductDetail', { product: item })

  const submitSearch = () => {
    const q = query.trim()
    if (q && !recent.includes(q)) {
      setRecent(prev => [q, ...prev].slice(0, 5))
    }
  }

  const removeRecent = (q) => setRecent(prev => prev.filter(x => x !== q))
  const clearRecent = () => setRecent([])

  const activeFilters = (sort !== 'Relevância' ? 1 : 0) + (maxPrice < 100 ? 1 : 0) + (minRating > 0 ? 1 : 0)
  const showResults = query.trim().length > 0 || activeFilters > 0

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.textLight} />
            <TextInput
              placeholder="O que você quer comer hoje?"
              placeholderTextColor={colors.textLight}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={20} color={colors.white} />
            {activeFilters > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!showResults ? (
          <>
            {recent.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Buscas recentes</Text>
                  <TouchableOpacity onPress={clearRecent}>
                    <Text style={styles.viewAll}>Limpar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentList}>
                  {recent.map((q, i) => (
                    <View key={i} style={styles.recentItem}>
                      <TouchableOpacity
                        style={styles.recentLeft}
                        onPress={() => setQuery(q)}
                      >
                        <Ionicons name="time-outline" size={18} color={colors.textLight} />
                        <Text style={styles.recentText}>{q}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeRecent(q)}>
                        <Ionicons name="close" size={18} color={colors.textLight} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categorias populares</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
              {popularCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catItem}
                  onPress={() => setQuery(cat.label)}
                >
                  <View style={styles.catCard}>
                    <Image source={cat.image} style={styles.catImage} resizeMode="cover" />
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sugestões</Text>
            </View>
            <FlatList
              data={allResults.slice(0, 5)}
              keyExtractor={i => i.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ResultCard item={item} onPress={() => goToProduct(item)} />
              )}
            />
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.sortText}>{sort}</Text>
            </View>
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyTitle}>Nada encontrado</Text>
                <Text style={styles.emptyText}>Tente ajustar a busca ou os filtros</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={i => i.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <ResultCard item={item} onPress={() => goToProduct(item)} />
                )}
              />
            )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  searchRow: { flexDirection: 'row', gap: 10 },
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
  searchInput: { flex: 1, fontSize: fonts.sizes.md, color: colors.textPrimary },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
  viewAll: { fontSize: fonts.sizes.sm, color: colors.primary },
  sortText: { fontSize: fonts.sizes.sm, color: colors.textMuted },
  recentList: { paddingHorizontal: 20 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  categoriesRow: { paddingHorizontal: 20, gap: 16 },
  catItem: { alignItems: 'center', gap: 8 },
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
  catImage: { width: '100%', height: '100%' },
  catLabel: { fontSize: fonts.sizes.sm, color: colors.textMuted },
  resultCard: {
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
  resultImg: {
    width: 90,
    height: 90,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  resultInfo: { flex: 1, padding: 12, gap: 4 },
  resultName: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.medium, color: colors.textPrimary },
  resultStore: { fontSize: fonts.sizes.sm, color: colors.textMuted },
  resultBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  resultPrice: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.medium, color: colors.primary },
  resultRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resultRatingText: { fontSize: fonts.sizes.sm, color: colors.textPrimary },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptyText: { fontSize: fonts.sizes.md, color: colors.textMuted, textAlign: 'center' },
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fonts.sizes.sm, color: colors.textPrimary, fontWeight: fonts.weight.medium },
  chipTextActive: { color: colors.white },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 24 },
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
})
