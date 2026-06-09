import { useEffect } from 'react'
import { NavigationContainer, createNavigationContainerRef, CommonActions } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from '../screens/Home'
import SearchScreen from '../screens/Search'
import CartScreen from '../screens/Cart'
import OrdersScreen from '../screens/Orders'
import ProfileScreen from '../screens/Profile'
import QRScannerScreen from '../screens/QRScanner'
import ProductDetailScreen from '../screens/ProductDetail'
import LoginScreen from '../screens/Login'
import RegisterScreen from '../screens/Register'
import RestaurantDetailScreen from '../screens/RestaurantDetail'

import { colors } from '../constants'
import { useCart } from '../context/CartContext'
import { setUnauthorizedHandler } from '../services/api'

export const navigationRef = createNavigationContainerRef()

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function CenterScanButton({ onPress, accessibilityState }) {
  const focused = accessibilityState?.selected
  return (
    <TouchableOpacity style={styles.centerBtnWrap} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.centerBtn, focused && styles.centerBtnFocused]}>
        <Ionicons name="qr-code-outline" size={28} color={colors.white} />
      </View>
    </TouchableOpacity>
  )
}

function TabNavigator() {
  const { cartItems } = useCart()
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0)

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textLight,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          tabBarButton: (props) => <CenterScanButton {...props} />,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.white }
        }}
      />
    </Tab.Navigator>
  )
}

export default function Navigation() {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (navigationRef.isReady()) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        )
      }
    })
  }, [])

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
  },
  centerBtnWrap: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  centerBtn: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  centerBtnFocused: {
    backgroundColor: colors.primaryDark,
  },
})
