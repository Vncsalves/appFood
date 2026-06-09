import { SafeAreaProvider } from 'react-native-safe-area-context'
import Navigation from './src/navigation'
import { CartProvider } from './src/context/CartContext'

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <Navigation />
      </CartProvider>
    </SafeAreaProvider>
  )
}
