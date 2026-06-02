# dentu

App de delivery de comida construído com Expo + React Native.

## Stack

- Expo SDK 52
- React Native 0.76
- React Navigation (stack + bottom tabs)
- Expo Camera (scanner QR)
- Expo Linear Gradient
- Vector Icons (Ionicons)

## Pré-requisitos

- Node 20+
- Expo Go atualizado (Android/iOS) ou dev build
- Android Studio / Xcode se for rodar emulador

## Instalação

```bash
npm install --legacy-peer-deps
```

## Rodar

```bash
npx expo start -c
```

- `a` → Android
- `i` → iOS
- `w` → Web
- Escaneia QR no Expo Go pra rodar no celular

## Estrutura

```
src/
├── assets/       # imagens das categorias
├── constants/    # cores, fontes
├── navigation/   # stack + tabs
└── screens/
    ├── Home/
    ├── Search/
    ├── Cart/
    ├── Orders/
    ├── Profile/
    ├── ProductDetail/
    └── QRScanner/
```

## Features

- Home com categorias, banners e seções de produtos por horário
- Busca de comida/restaurante
- Detalhes do produto
- Carrinho
- Histórico de pedidos
- Perfil
- Scanner QR (mesa/cupom)
