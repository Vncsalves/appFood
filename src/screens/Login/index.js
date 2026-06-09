import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { colors, fonts } from '../../constants'
import { loginUser, getToken } from '../../services/api'
import { useCart } from '../../context/CartContext'

const foods = ['pizza', 'dog', 'japa', 'açaí', 'burger']

export default function LoginScreen() {
  const navigation = useNavigation()
  const { resetSession } = useCart()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [foodIndex, setFoodIndex] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    async function checkPersistedToken() {
      try {
        const token = await getToken()
        if (token) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Tabs' }],
            })
          )
          return
        }
      } catch (error) {
        console.error('Error checking persisted token:', error)
      } finally {
        setIsCheckingToken(false)
      }
    }
    checkPersistedToken()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setFoodIndex((prev) => (prev + 1) % foods.length)
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start()
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [fadeAnim])

  if (isCheckingToken) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={[colors.white, colors.white, '#FF8B5E', colors.primary]}
          locations={[0, 0.35, 0.72, 1]}
          style={[styles.gradient, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <ActivityIndicator size="large" color={colors.white} />
        </LinearGradient>
      </View>
    )
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos vazios', 'Por favor, preencha todos os campos.')
      return
    }

    setIsLoading(true)

    try {
      await resetSession().catch(() => {})
      const data = await loginUser(email, password)

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Tabs' }],
        })
      )
    } catch (error) {
      Alert.alert('Erro ao entrar', error.message || 'Verifique sua conexão e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[colors.white, colors.white, '#FF8B5E', colors.primary]}
        locations={[0, 0.35, 0.72, 1]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <View style={styles.subtitleContainer}>
                  <Text style={styles.headerSubtitle}>O que acha de pedir </Text>
                  <Animated.Text
                    style={[
                      styles.headerSubtitle,
                      styles.foodHighlight,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [6, 0]
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    {foods[foodIndex]}
                  </Animated.Text>
                  <Text style={styles.headerSubtitle}> ?</Text>
                </View>
                <Text style={styles.headerTitle}>É dentu !</Text>
              </View>

              <View style={styles.spacer} />

              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Login</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="e-mail"
                    placeholderTextColor={colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    disabled={isLoading}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="senha"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    disabled={isLoading}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.redirectLink}
                  onPress={() => navigation.navigate('Register')}
                  disabled={isLoading}
                >
                  <Text style={styles.redirectText}>
                    não tem conta ? <Text style={styles.redirectHighlight}>cadastrar</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  subtitleContainer: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: fonts.weight.medium,
    letterSpacing: -0.5,
  },
  foodHighlight: {
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 48,
    color: colors.textPrimary,
    fontWeight: fonts.weight.bold,
    marginTop: 4,
    letterSpacing: -1.5,
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weight.bold,
    color: colors.white,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 14,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  eyeBtn: {
    paddingRight: 16,
  },
  button: {
    backgroundColor: colors.white,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: colors.primary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weight.bold,
  },
  redirectLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  redirectText: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  redirectHighlight: {
    color: colors.white,
    fontWeight: fonts.weight.bold,
    textDecorationLine: 'underline',
  },
})
