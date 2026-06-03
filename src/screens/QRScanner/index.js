import { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Linking, ActivityIndicator, Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { colors, fonts } from '../../constants'

export default function QRScannerScreen() {
  const navigation = useNavigation()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(null)
  const [flash, setFlash] = useState(false)
  const [facing, setFacing] = useState('back')

  useFocusEffect(
    useCallback(() => {
      setScanned(null)
    }, [])
  )

  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned) return
    setScanned({ type, data })
  }

  const openLink = async () => {
    if (!scanned?.data) return
    const url = scanned.data
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await Linking.openURL(url)
    }
  }

  if (!permission) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear QR</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={64} color={colors.primary} />
          <Text style={styles.permissionTitle}>Acesso à câmera</Text>
          <Text style={styles.permissionText}>
            Precisamos da câmera para escanear QR codes de restaurantes e produtos.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Permitir câmera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={flash}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear QR</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(!flash)}>
            <Ionicons name={flash ? 'flash' : 'flash-off'} size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.hint}>Aponte para o QR code do restaurante ou produto</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <Ionicons name="camera-reverse-outline" size={24} color={colors.white} />
            <Text style={styles.controlText}>Virar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}>
            <Ionicons name="image-outline" size={24} color={colors.white} />
            <Text style={styles.controlText}>Galeria</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal transparent animationType="fade" visible={!!scanned} onRequestClose={() => setScanned(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Código lido!</Text>
            <Text style={styles.modalType}>{scanned?.type?.toUpperCase()}</Text>
            <View style={styles.modalDataBox}>
              <Text style={styles.modalData} numberOfLines={4}>{scanned?.data}</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={() => setScanned(null)}>
                <Text style={styles.modalBtnGhostText}>Escanear outro</Text>
              </TouchableOpacity>
              {(scanned?.data?.startsWith('http://') || scanned?.data?.startsWith('https://')) && (
                <TouchableOpacity style={styles.modalBtn} onPress={openLink}>
                  <Text style={styles.modalBtnText}>Abrir link</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerScreen: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weight.medium,
    color: colors.white,
  },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  frame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: 4, borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: 4, borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 4, borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  hint: {
    fontSize: fonts.sizes.md,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  controlText: {
    fontSize: fonts.sizes.sm,
    color: colors.white,
    fontWeight: fonts.weight.medium,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 14,
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 24,
  },
  permissionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginTop: 8,
  },
  permissionText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  permissionBtnText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.white,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  modalType: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  modalDataBox: {
    width: '100%',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  modalData: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
    color: colors.white,
  },
  modalBtnGhost: {
    backgroundColor: colors.background,
  },
  modalBtnGhostText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.medium,
    color: colors.textPrimary,
  },
})
