import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { MainScreen } from './src/screens/MainScreen'
import { AddSubscriptionScreen } from './src/screens/AddSubscriptionScreen'

type ScreenState = 'main' | 'add'

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('main')

  return (
    <>
      <StatusBar style='dark' />
      {screen === 'main' ? (
        <MainScreen onAddPress={() => setScreen('add')} />
      ) : (
        <AddSubscriptionScreen onBack={() => setScreen('main')} />
      )}
    </>
  )
}
