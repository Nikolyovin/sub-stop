import React, { useState, useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar } from 'expo-status-bar'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { MainScreen } from './src/screens/MainScreen'
import { SubscriptionDetailsScreen } from './src/screens/SubscriptionDetailsScreen'
import { SubscriptionFormScreen } from './src/screens/SubscriptionFormScreen'
import { SettingsScreen } from './src/screens/SettingsScreen' // <-- Добавили
import { ThemeProvider } from './src/theme/ThemeContext' // <-- Добавили
import { useSubscriptionStore } from './src/store/useSubscriptionStore'

// Тип для экранов (добавили settings)
type ScreenState = 'main' | 'form' | 'details' | 'settings'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const [screen, setScreen] = useState<ScreenState>('main')
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)

  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const subToEdit = subscriptions.find((s) => s.id === selectedSubId)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('@sub_stop_onboarding_seen')
        if (value !== 'true') {
          setShowOnboarding(true)
        }
      } catch (e) {
        console.error('Ошибка проверки онбординга', e)
      } finally {
        setIsLoading(false)
      }
    }
    checkOnboarding()
  }, [])

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <ActivityIndicator size='large' color='#2563EB' />
      </View>
    )
  }

  if (showOnboarding) {
    return (
      <ThemeProvider>
        <StatusBar style='dark' />
        <OnboardingScreen onFinish={() => setShowOnboarding(false)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <StatusBar style='auto' />

      {screen === 'main' && (
        <MainScreen
          onAddPress={() => {
            setSelectedSubId(null)
            setScreen('form')
          }}
          onOpenDetails={(id) => {
            setSelectedSubId(id)
            setScreen('details')
          }}
          onOpenSettings={() => setScreen('settings')} // <-- Передали пропс
        />
      )}

      {screen === 'details' && selectedSubId && (
        <SubscriptionDetailsScreen
          subscriptionId={selectedSubId}
          onBack={() => setScreen('main')}
          onEdit={(sub) => {
            setSelectedSubId(sub.id)
            setScreen('form')
          }}
        />
      )}

      {screen === 'form' && (
        <SubscriptionFormScreen
          initialData={subToEdit}
          onBack={() => setScreen(selectedSubId ? 'details' : 'main')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen onBack={() => setScreen('main')} /> // <-- Рендерим настройки
      )}
    </ThemeProvider>
  )
}
