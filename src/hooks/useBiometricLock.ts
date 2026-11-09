import { useState, useEffect, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LOCK_KEY = '@sub_stop_biometric_lock'

export const useBiometricLock = () => {
  const [isLockEnabled, setIsLockEnabled] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)

  useEffect(() => {
    const checkAvailability = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      setIsBiometricAvailable(hasHardware && isEnrolled)
    }
    checkAvailability()

    AsyncStorage.getItem(LOCK_KEY).then((value) => {
      if (value === 'true') {
        setIsLockEnabled(true)
        setIsUnlocked(false)
      } else {
        setIsUnlocked(true)
      }
    })
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        // Блокируем при уходе в фон
        if (isLockEnabled && nextState === 'background') {
          setIsUnlocked(false)
        }
      },
    )
    return () => subscription.remove()
  }, [isLockEnabled])

  const authenticate = useCallback(async () => {
    if (!isLockEnabled) return true

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Вход в Стоп-Подписку',
      cancelLabel: 'Отмена',
      disableDeviceFallback: false,
      fallbackLabel: 'Использовать пароль',
    })

    if (result.success) {
      setIsUnlocked(true)
      return true
    }
    return false
  }, [isLockEnabled])

  const toggleLock = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const success = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Подтвердите, чтобы включить защиту',
      })
      if (!success.success) return
    }
    setIsLockEnabled(enabled)
    await AsyncStorage.setItem(LOCK_KEY, String(enabled))
  }, [])

  return {
    isLockEnabled,
    isUnlocked,
    isBiometricAvailable,
    authenticate,
    toggleLock,
  }
}
