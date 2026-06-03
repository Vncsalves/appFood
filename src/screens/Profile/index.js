import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Switch, Modal, TextInput, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { colors, fonts } from '../../constants'

const stats = [
  { label: 'Pedidos', value: '24' },
  { label: 'Favoritos', value: '8' },
  { label: 'Cupons', value: '3' },
]

export default function ProfileScreen() {
  const navigation = useNavigation()
  const [user, setUser] = useState({ name: 'João Silva', email: 'joao.silva@email.com' })
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState(user)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('Português')
  const [langOpen, setLangOpen] = useState(false)

  const saveProfile = () => {
    if (draft.name.trim() && draft.email.trim()) {
      setUser(draft)
      setEditOpen(false)
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
          onPress: () => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Tabs' }] })),
        },
      ]
    )
  }

  const showInfo = (title, msg) => Alert.alert(title, msg)

  const menuSections = [
    {
      title: 'Conta',
      items: [
        { id: 'addresses', icon: 'location-outline', label: 'Endereços salvos', onPress: () => showInfo('Endereços', 'Você não tem endereços salvos ainda.') },
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
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setDraft(user); setEditOpen(true) }}>
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
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={draft.name}
              onChangeText={t => setDraft(d => ({ ...d, name: t }))}
              placeholder="Seu nome"
              placeholderTextColor={colors.textLight}
            />
            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={draft.email}
              onChangeText={t => setDraft(d => ({ ...d, email: t }))}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={saveProfile}>
              <Text style={styles.modalBtnText}>Salvar</Text>
            </TouchableOpacity>
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
})
