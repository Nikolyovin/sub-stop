import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { MobileAds } from "yandex-mobile-ads";

import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { MainScreen } from "./src/screens/MainScreen";
import { SubscriptionDetailsScreen } from "./src/screens/SubscriptionDetailsScreen";
import { SubscriptionFormScreen } from "./src/screens/SubscriptionFormScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { StatisticsScreen } from "./src/screens/StatisticsScreen";
import { PremiumScreen } from "./src/screens/PremiumScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { LockScreen } from "./src/components/LockScreen";

import { ThemeProvider } from "./src/theme/ThemeContext";
import { useSubscriptionStore } from "./src/store/useSubscriptionStore";
import { useSubscriptionSync } from "./src/hooks/useSubscriptionSync";
import { useBiometricLock } from "./src/hooks/useBiometricLock";
import { useSecurityStore } from "./src/store/useSecurityStore";
import { useCurrencyRates } from "./src/hooks/useCurrencyRates";
import { useInterstitialAd } from "./src/hooks/useInterstitialAd";

type ScreenState =
  | "main"
  | "form"
  | "details"
  | "settings"
  | "statistics"
  | "premium"
  | "calendar";

const AppContent = () => {
  const [screenStack, setScreenStack] = useState<ScreenState[]>(["main"]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [focusField, setFocusField] = useState<"note" | undefined>(undefined);

  const currentScreen = screenStack[screenStack.length - 1];

  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const subToEdit = subscriptions.find((s) => s.id === selectedSubId);

  useSubscriptionSync();
  useCurrencyRates();

  const { showActionAd } = useInterstitialAd();

  const navigate = (screen: ScreenState) => {
    setScreenStack((prev) => [...prev, screen]);
  };

  const goBack = () => {
    setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  useEffect(() => {
    const backAction = () => {
      if (screenStack.length > 1) {
        goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [screenStack]);

  return (
    <>
      {currentScreen === "main" && (
        <MainScreen
          onAddPress={() => {
            setSelectedSubId(null);
            setFocusField(undefined);
            navigate("form");
          }}
          onOpenDetails={(id) => {
            setSelectedSubId(id);
            navigate("details");
          }}
          onOpenSettings={() => navigate("settings")}
          onOpenStatistics={() => navigate("statistics")}
          onOpenCalendar={() => navigate("calendar")}
          onShowAd={showActionAd}
        />
      )}

      {currentScreen === "details" && selectedSubId && (
        <SubscriptionDetailsScreen
          subscriptionId={selectedSubId}
          onBack={goBack}
          onEdit={(sub, focus) => {
            setSelectedSubId(sub.id);
            setFocusField(focus);
            navigate("form");
          }}
        />
      )}

      {currentScreen === "form" && (
        <SubscriptionFormScreen
          initialData={subToEdit}
          onBack={goBack}
          focusField={focusField}
        />
      )}

      {currentScreen === "settings" && (
        <SettingsScreen
          onBack={goBack}
          onOpenPremium={() => navigate("premium")}
        />
      )}

      {currentScreen === "statistics" && <StatisticsScreen onBack={goBack} />}

      {/* 🚀 ИСПРАВЛЕНО: Добавлена логика открытия деталей из календаря */}
      {currentScreen === "calendar" && (
        <CalendarScreen
          onBack={goBack}
          onOpenPremium={() => navigate("premium")}
          onOpenDetails={(id) => {
            setSelectedSubId(id);
            navigate("details");
          }}
        />
      )}

      {currentScreen === "premium" && <PremiumScreen onBack={goBack} />}
    </>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { isLockEnabled, isUnlocked } = useSecurityStore();
  const { isAuthenticating, authenticate } = useBiometricLock();

  useEffect(() => {
    try {
      MobileAds.initialize();
    } catch (error) {
      console.error("Ошибка инициализации рекламы:", error);
    }
  }, []);

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
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <StatusBar style="auto" />

            {isLockEnabled && !isUnlocked ? (
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
    </SafeAreaProvider>
  );
}
