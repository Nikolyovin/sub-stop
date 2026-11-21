import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useSecurityStore } from "../store/useSecurityStore";

const GRACE_PERIOD_MS = 30000;

// 🚀 ВЫНОСИМ РЕФ НА УРОВЕНЬ МОДУЛЯ, чтобы хук рекламы мог его сбрасывать
export const backgroundTimestampRef = { current: null as number | null };

export const useBiometricLock = () => {
  const { isLockEnabled, isUnlocked, setLockEnabled, setUnlocked } =
    useSecurityStore();

  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingHardware, setIsCheckingHardware] = useState(true);

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
            backgroundTimestampRef.current = Date.now();
          } else if (nextState === "active") {
            if (backgroundTimestampRef.current !== null) {
              const timeAway = Date.now() - backgroundTimestampRef.current;
              if (timeAway > GRACE_PERIOD_MS) {
                setUnlocked(false);
              }
              backgroundTimestampRef.current = null;
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
        setUnlocked(true);
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
      setLockEnabled(enabled);
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
