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
import { registerUser, loginUser } from '../../services/api'

const foods = ['pizza', 'dog', 'japa', 'açaí', 'burger']

const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const maskPhone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

export default function RegisterScreen() {
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [foodIndex, setFoodIndex] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current

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

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !cpf.trim() ||
      !phone.trim()
    ) {
      Alert.alert('Campos vazios', 'Por favor, preencha todos os campos.')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Senhas diferentes', 'As senhas não coincidem.')
      return
    }

    if (password.length < 8) {
      Alert.alert('Senha inválida', 'A senha deve ter no mínimo 8 caracteres.')
      return
    }

    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      Alert.alert('CPF inválido', 'Por favor, insira um CPF com 11 dígitos.')
      return
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      Alert.alert('Telefone inválido', 'Por favor, insira um telefone válido com DDD.')
      return
    }

    setIsLoading(true)

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        cpf,
        phone: cleanPhone
      })

      await loginUser(email.trim(), password)

      Alert.alert(
        'Cadastro realizado!',
        'Sua conta foi criada com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Tabs' }],
                })
              )
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error.message || 'Verifique os dados informados e tente novamente.')
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
                <Text style={styles.formTitle}>Cadastro</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="nome completo"
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="e-mail"
                    placeholderTextColor={colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="CPF"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    value={cpf}
                    onChangeText={(text) => setCpf(maskCPF(text))}
                    maxLength={14}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="telefone (DDD)"
                    placeholderTextColor={colors.textLight}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(text) => setPhone(maskPhone(text))}
                    maxLength={15}
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

                <View style={[
                  styles.inputContainer,
                  confirmPassword.length > 0 && {
                    borderColor: password === confirmPassword ? '#81C784' : '#FF8A80',
                    borderWidth: 1.5
                  }
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="confirmar senha"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                {confirmPassword.length > 0 && (
                  <Text style={[
                    styles.validationHelper,
                    { color: password === confirmPassword ? '#A2F0A5' : '#FFCDD2' }
                  ]}>
                    {password === confirmPassword ? '✓ As senhas coincidem' : '✗ As senhas não coincidem'}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRegister}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.buttonText}>Cadastrar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.redirectLink}
                  onPress={() => navigation.navigate('Login')}
                  disabled={isLoading}
                >
                  <Text style={styles.redirectText}>
                    já tem conta ? <Text style={styles.redirectHighlight}>entrar</Text>
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
  validationHelper: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    fontWeight: '600',
    paddingLeft: 4,
  },
})
