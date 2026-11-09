import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { MainScreen } from "./src/screens/MainScreen";
import { SubscriptionDetailsScreen } from "./src/screens/SubscriptionDetailsScreen";
import { SubscriptionFormScreen } from "./src/screens/SubscriptionFormScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { StatisticsScreen } from "./src/screens/StatisticsScreen";
import { LockScreen } from "./src/components/LockScreen";

import { ThemeProvider } from "./src/theme/ThemeContext";
import { useSubscriptionStore } from "./src/store/useSubscriptionStore";
import { useSubscriptionSync } from "./src/hooks/useSubscriptionSync";
import { useBiometricLock } from "./src/hooks/useBiometricLock";

type ScreenState = "main" | "form" | "details" | "settings" | "statistics";

const AppContent = () => {
  const [screen, setScreen] = useState<ScreenState>("main");
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [focusField, setFocusField] = useState<"note" | undefined>(undefined);

  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const subToEdit = subscriptions.find((s) => s.id === selectedSubId);

  useSubscriptionSync();

  return (
    <>
      {screen === "main" && (
        <MainScreen
          onAddPress={() => {
            setSelectedSubId(null);
            setFocusField(undefined);
            setScreen("form");
          }}
          onOpenDetails={(id) => {
            setSelectedSubId(id);
            setScreen("details");
          }}
          onOpenSettings={() => setScreen("settings")}
          onOpenStatistics={() => setScreen("statistics")}
        />
      )}

      {screen === "details" && selectedSubId && (
        <SubscriptionDetailsScreen
          subscriptionId={selectedSubId}
          onBack={() => setScreen("main")}
          onEdit={(sub, focus) => {
            setSelectedSubId(sub.id);
            setFocusField(focus);
            setScreen("form");
          }}
        />
      )}

      {screen === "form" && (
        <SubscriptionFormScreen
          initialData={subToEdit}
          onBack={() => setScreen(selectedSubId ? "details" : "main")}
          focusField={focusField}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen onBack={() => setScreen("main")} />
      )}

      {screen === "statistics" && (
        <StatisticsScreen onBack={() => setScreen("main")} />
      )}
    </>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 🚀 Деструктурируем isAuthenticating
  const { isLockEnabled, isUnlocked, isAuthenticating, authenticate } =
    useBiometricLock();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem("@sub_stop_onboarding_seen");
        if (value !== "true") setShowOnboarding(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BottomSheetModalProvider>
          <StatusBar style="auto" />

          {isLockEnabled && !isUnlocked ? (
            /* 🚀 Передаем isAuthenticating в LockScreen */
            <LockScreen
              onUnlock={authenticate}
              isAuthenticating={isAuthenticating}
            />
          ) : showOnboarding ? (
            <OnboardingScreen onFinish={() => setShowOnboarding(false)} />
          ) : (
            <AppContent />
          )}
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
