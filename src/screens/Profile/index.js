import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Switch, Modal, TextInput, Alert, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, CommonActions } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { colors, fonts } from '../../constants'
import { setToken, fetchUserProfile, updateUserProfile, fetchUserAddresses, fetchOrders } from '../../services/api'
import { useCart } from '../../context/CartContext'

export default function ProfileScreen() {
  const navigation = useNavigation()
  const { resetSession } = useCart()
  const [user, setUser] = useState({ id: 0, name: '', email: '', cpf: '', phone: '', photo: '' })
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState({ name: '', email: '', cpf: '', phone: '', photo: '', photoFile: null })
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('Português')
  const [langOpen, setLangOpen] = useState(false)
  
  const [addresses, setAddresses] = useState([])
  const [addressesOpen, setAddressesOpen] = useState(false)
  const [ordersCount, setOrdersCount] = useState(0)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setProfileLoading(true)
        const profile = await fetchUserProfile()
        console.log('Backend Profile loaded:', profile)
        
        const userObj = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          cpf: profile.cpf || '',
          phone: profile.phone || '',
          photo: profile.photo || '',
        }
        setUser(userObj)
        setDraft({ ...userObj, photoFile: null })
        
        try {
          const ordersList = await fetchOrders()
          if (ordersList) {
            setOrdersCount(ordersList.length)
          }
        } catch (err) {
          console.log('Error loading orders in profile:', err)
        }

        try {
          const addressList = await fetchUserAddresses()
          if (addressList) {
            setAddresses(addressList)
          }
        } catch (err) {
          console.log('Error loading addresses in profile:', err)
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
        Alert.alert('Erro', 'Não foi possível carregar as informações do perfil.')
      } finally {
        setProfileLoading(false)
      }
    }
    loadData()
  }, [])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para alterar a imagem de perfil.')
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        const mimeType = asset.mimeType || 'image/jpeg'
        const ext = mimeType.split('/')[1] || 'jpg'
        setDraft(d => ({
          ...d,
          photo: asset.uri,
          photoFile: {
            uri: asset.uri,
            type: mimeType,
            name: `profile.${ext}`,
          },
        }))
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.')
    }
  }

  const saveProfile = async () => {
    if (!draft.name.trim()) {
      Alert.alert('Erro', 'O nome não pode estar em branco.')
      return
    }
    
    try {
      setProfileLoading(true)
      await updateUserProfile(user.id, {
        name: draft.name.trim(),
        cpf: draft.cpf.trim(),
        phone: draft.phone.trim(),
        photoFile: draft.photoFile,
      })

      const fresh = await fetchUserProfile()
      const userObj = {
        id: fresh.id,
        name: fresh.name,
        email: fresh.email,
        cpf: fresh.cpf || '',
        phone: fresh.phone || '',
        photo: fresh.photo || '',
      }
      setUser(userObj)
      setDraft({ ...userObj, photoFile: null })
      setEditOpen(false)
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!')
    } catch (err) {
      console.error('Failed to update profile:', err)
      Alert.alert('Erro', err.message || 'Não foi possível atualizar o perfil.')
    } finally {
      setProfileLoading(false)
    }
  }

  const logout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await setToken(null)
            await resetSession().catch(() => {})
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }))
          },
        },
      ]
    )
  }

  const openAddressesModal = async () => {
    try {
      setProfileLoading(true)
      const data = await fetchUserAddresses()
      setAddresses(data)
      setAddressesOpen(true)
    } catch (err) {
      console.error('Error fetching addresses:', err)
      Alert.alert('Erro', 'Não foi possível carregar os endereços salvos.')
    } finally {
      setProfileLoading(false)
    }
  }

  const showInfo = (title, msg) => Alert.alert(title, msg)

  const stats = [
    { label: 'Pedidos', value: String(ordersCount) },
    { label: 'Endereços', value: String(addresses.length) },
    { label: 'Cupons', value: '3' },
  ]

  const menuSections = [
    {
      title: 'Conta',
      items: [
        { id: 'addresses', icon: 'location-outline', label: 'Endereços salvos', onPress: openAddressesModal },
        { id: 'payment', icon: 'card-outline', label: 'Métodos de pagamento', onPress: () => showInfo('Pagamento', 'Adicione um método de pagamento na próxima atualização.') },
        { id: 'favorites', icon: 'heart-outline', label: 'Favoritos', onPress: () => showInfo('Favoritos', 'Seus produtos favoritos aparecem aqui.') },
        { id: 'coupons', icon: 'pricetag-outline', label: 'Cupons e ofertas', onPress: () => showInfo('Cupons', 'Use DENTU10 para 10% OFF.') },
      ],
    },
    {
      title: 'Preferências',
      items: [
        { id: 'notifications', icon: 'notifications-outline', label: 'Notificações', toggle: notifications, onToggle: setNotifications },
        { id: 'language', icon: 'globe-outline', label: 'Idioma', value: language, onPress: () => setLangOpen(true) },
        { id: 'theme', icon: 'moon-outline', label: 'Modo escuro', toggle: darkMode, onToggle: setDarkMode },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { id: 'help', icon: 'help-circle-outline', label: 'Central de ajuda', onPress: () => showInfo('Ajuda', 'WhatsApp: (11) 99999-0000') },
        { id: 'terms', icon: 'document-text-outline', label: 'Termos de uso', onPress: () => showInfo('Termos', 'Termos atualizados em 01/06/2026.') },
        { id: 'privacy', icon: 'shield-checkmark-outline', label: 'Privacidade', onPress: () => showInfo('Privacidade', 'Seus dados são protegidos pela LGPD.') },
        { id: 'logout', icon: 'log-out-outline', label: 'Sair', danger: true, onPress: logout },
      ],
    },
  ]

  if (profileLoading && user.id === 0) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Perfil</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => showInfo('Configurações', 'Ajuste preferências abaixo.')}>
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          {user.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={44} color={colors.textLight} />
            </View>
          )}
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setDraft({ ...user, photoFile: null }); setEditOpen(true) }}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.editText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.statBox, i < stats.length - 1 && styles.statDivider]}
              onPress={() => {
                if (s.label === 'Pedidos') navigation.navigate('Tabs', { screen: 'Orders' })
                if (s.label === 'Endereços') openAddressesModal()
              }}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    disabled={item.toggle !== undefined}
                    activeOpacity={item.toggle !== undefined ? 1 : 0.6}
                  >
                    <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.danger ? '#F44336' : colors.primary}
                      />
                    </View>
                    <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                      {item.label}
                    </Text>
                    {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                    {item.toggle !== undefined ? (
                      <Switch
                        value={item.toggle}
                        onValueChange={item.onToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.white}
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                    )}
                  </TouchableOpacity>
                  {i < section.items.length - 1 && <View style={styles.itemDivider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Versão 1.0.0</Text>
      </ScrollView>

      <Modal transparent animationType="slide" visible={editOpen} onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={() => setEditOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.modalAvatarContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarPickerWrapper} activeOpacity={0.8}>
                  {draft.photo ? (
                    <Image source={{ uri: draft.photo }} style={styles.modalAvatar} />
                  ) : (
                    <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={48} color={colors.textLight} />
                    </View>
                  )}
                  <View style={styles.cameraOverlay}>
                    <Ionicons name="camera-outline" size={18} color={colors.white} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.changePhotoText}>Alterar foto de perfil</Text>
              </View>

              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={draft.name}
                onChangeText={t => setDraft(d => ({ ...d, name: t }))}
                placeholder="Seu nome"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputLabel}>E-mail (Não editável)</Text>
              <TextInput
                style={[styles.input, { opacity: 0.6 }]}
                value={draft.email}
                editable={false}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputLabel}>CPF</Text>
              <TextInput
                style={styles.input}
                value={draft.cpf}
                onChangeText={t => setDraft(d => ({ ...d, cpf: t }))}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={draft.phone}
                onChangeText={t => setDraft(d => ({ ...d, phone: t }))}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.modalBtn} onPress={saveProfile}>
                <Text style={styles.modalBtnText}>Salvar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={addressesOpen} onRequestClose={() => setAddressesOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Endereços salvos</Text>
              <TouchableOpacity onPress={() => setAddressesOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {addresses.length === 0 ? (
                <Text style={styles.emptyDetailText}>Nenhum endereço cadastrado no banco de dados.</Text>
              ) : (
                addresses.map((addr, idx) => (
                  <View key={idx} style={styles.addressItemCard}>
                    <Ionicons name="location" size={20} color={colors.primary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressItemText}>{addr.street}</Text>
                      <Text style={styles.addressItemSub}>{addr.city} - {addr.state} · CEP {addr.zipCode}</Text>
                    </View>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Padrão</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={langOpen} onRequestClose={() => setLangOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Idioma</Text>
              <TouchableOpacity onPress={() => setLangOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {['Português', 'English', 'Español'].map(lang => (
              <TouchableOpacity
                key={lang}
                style={styles.langItem}
                onPress={() => { setLanguage(lang); setLangOpen(false) }}
              >
                <Text style={styles.langText}>{lang}</Text>
                {language === lang && <Ionicons name="checkmark" size={22} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  settingsBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: fonts.sizes.xl, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  userEmail: { fontSize: fonts.sizes.sm, color: colors.textMuted },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editText: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: fonts.weight.medium },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { borderRightWidth: 1, borderRightColor: colors.border },
  statValue: { fontSize: fonts.sizes.xl, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  statLabel: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#FFEBEE' },
  menuLabel: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  menuLabelDanger: { color: '#F44336' },
  menuValue: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginRight: 4 },
  itemDivider: { height: 1, backgroundColor: colors.border, marginLeft: 66 },
  version: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 32,
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
  inputLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  modalBtnText: { fontSize: fonts.sizes.md, fontWeight: fonts.weight.bold, color: colors.white },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  langText: { fontSize: fonts.sizes.md, color: colors.textPrimary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    marginTop: 12,
  },
  addressItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  addressItemText: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
  },
  addressItemSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  emptyDetailText: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 24,
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarPickerWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalAvatar: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    marginTop: 8,
    fontWeight: fonts.weight.semibold,
  },
})
