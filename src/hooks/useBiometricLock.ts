import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useSecurityStore } from "../store/useSecurityStore";

const GRACE_PERIOD_MS = 30000;

export const useBiometricLock = () => {
  // 🚀 Берем состояние из глобального стора
  const { isLockEnabled, isUnlocked, setLockEnabled, setUnlocked } =
    useSecurityStore();

  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingHardware, setIsCheckingHardware] = useState(true);

  const backgroundTimestamp = useRef<number | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
      setIsCheckingHardware(false);
    };
    checkAvailability();
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
                setUnlocked(false); // Блокируем глобально
              }
              backgroundTimestamp.current = null;
            }
          }
        }
      },
    );
    return () => subscription.remove();
  }, [isLockEnabled, setUnlocked]);

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
        setUnlocked(true); // Разблокируем глобально
        return true;
      }
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isLockEnabled, isAuthenticating, setUnlocked]);

  const toggleLock = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const success = await LocalAuthentication.authenticateAsync({
          promptMessage: "Подтвердите для включения защиты",
        });
        if (!success.success) return;
      }
      setLockEnabled(enabled); // Обновляем глобально
    },
    [setLockEnabled],
  );

  return {
    isLockEnabled,
    isUnlocked,
    isBiometricAvailable,
    isAuthenticating,
    isCheckingHardware,
    authenticate,
    toggleLock,
  };
};
