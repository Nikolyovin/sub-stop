import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCK_KEY = "@sub_stop_biometric_lock";
const GRACE_PERIOD_MS = 30000;

export const useBiometricLock = () => {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLockLoading, setIsLockLoading] = useState(true);
  const [isCheckingHardware, setIsCheckingHardware] = useState(true);

  const backgroundTimestamp = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
      setIsCheckingHardware(false);

      const value = await AsyncStorage.getItem(LOCK_KEY);
      if (value === "true") {
        setIsLockEnabled(true);
        setIsUnlocked(false);
      } else {
        setIsLockEnabled(false);
        setIsUnlocked(true);
      }
      setIsLockLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (isLockEnabled) {
          if (nextState === "background" || nextState === "inactive") {
            backgroundTimestamp.current = Date.now();
          } else if (nextState === "active") {
            if (backgroundTimestamp.current) {
              const timeAway = Date.now() - backgroundTimestamp.current;
              if (timeAway > GRACE_PERIOD_MS) {
                setIsUnlocked(false);
              }
              backgroundTimestamp.current = null;
            }
          }
        }
      },
    );
    return () => subscription.remove();
  }, [isLockEnabled]);

  const authenticate = useCallback(async () => {
    if (!isLockEnabled || isAuthenticating) return true;

    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Вход в Стоп-Подписку",
        cancelLabel: "Отмена",
        disableDeviceFallback: false,
        fallbackLabel: "Использовать пароль",
      });
      if (result.success) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isLockEnabled, isAuthenticating]);

  const toggleLock = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const success = await LocalAuthentication.authenticateAsync({
        promptMessage: "Подтвердите для включения защиты",
      });
      if (!success.success) return;
    }
    setIsLockEnabled(enabled);
    setIsUnlocked(!enabled);
    await AsyncStorage.setItem(LOCK_KEY, String(enabled));
  }, []);

  return {
    isLockEnabled,
    isUnlocked,
    isBiometricAvailable,
    isAuthenticating,
    isLockLoading,
    isCheckingHardware,
    authenticate,
    toggleLock,
  };
};
