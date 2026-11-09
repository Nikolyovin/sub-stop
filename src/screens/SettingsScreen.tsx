import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native'
import Constants from 'expo-constants'
import { useTheme } from '../theme/ThemeContext'
import { useSettingsStore } from '../store/useSettingsStore'
import { SettingsRow } from '../components/ui/SettingsRow'
import { HeaderBackButton } from '../components/ui/HeaderBackButton'
import { SPACING, TYPOGRAPHY, ThemeColors, BORDER_RADIUS } from '../theme'
import {
  sendTestNotification,
  requestNotificationPermissions,
} from '../services/notificationService'

interface SettingsScreenProps {
  onBack: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, toggleTheme, colors } = useTheme()

  // Достаем новые настройки из стора
  const {
    notificationsEnabled,
    toggleNotifications,
    notifyTrials,
    toggleNotifyTrials,
    notifyRegular,
    toggleNotifyRegular,
  } = useSettingsStore()

  const styles = useMemo(() => createStyles(colors), [colors])

  const handleTestNotification = async () => {
    const hasPermission = await requestNotificationPermissions()
    if (hasPermission) {
      await sendTestNotification()
      Alert.alert('Успех', 'Тестовое уведомление отправлено!')
    } else {
      Alert.alert('Ошибка', 'Вы не дали разрешение на уведомления.')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Основные</Text>

        <SettingsRow
          icon='notifications-outline'
          title='Уведомления'
          value={notificationsEnabled}
          onToggle={toggleNotifications}
        />

        {/* Показываем поднастройки только если главный тумблер включен */}
        {notificationsEnabled && (
          <View style={styles.subSettingsContainer}>
            <SettingsRow
              icon='time-outline'
              title='Обычные подписки'
              value={notifyRegular}
              onToggle={toggleNotifyRegular}
            />
            <SettingsRow
              icon='alert-circle-outline'
              title='Пробные периоды (Триалы)'
              value={notifyTrials}
              onToggle={toggleNotifyTrials}
            />
          </View>
        )}

        <SettingsRow
          icon='moon-outline'
          title='Темная тема'
          value={theme === 'dark'}
          onToggle={toggleTheme}
        />

        <Text style={styles.sectionTitle}>Тестирование</Text>

        <TouchableOpacity
          style={styles.testBtn}
          onPress={handleTestNotification}
          activeOpacity={0.7}
        >
          <Text style={styles.testBtnText}>
            Отправить тестовое уведомление 🔔
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>О приложении</Text>

        <SettingsRow
          icon='shield-checkmark-outline'
          title='Политика конфиденциальности'
          onPress={() =>
            Linking.openURL('https://nikolyovin.github.io/sub-stop-privacy/')
          }
        />

        <Text style={styles.versionText}>
          Версия {Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </ScrollView>
    </View>
  )
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
    },
    placeholder: { width: 44 },
    headerTitle: { ...TYPOGRAPHY.title, color: colors.textMain, fontSize: 22 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    sectionTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textSecondary,
      fontSize: 14,
      textTransform: 'uppercase',
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    // Стиль для вложенных настроек уведомлений
    subSettingsContainer: {
      paddingLeft: SPACING.sm,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
      marginLeft: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    testBtn: {
      backgroundColor: `${colors.primary}15`,
      padding: SPACING.md,
      borderRadius: 16,
      alignItems: 'center',
    },
    testBtnText: {
      ...TYPOGRAPHY.button,
      color: colors.primary,
      fontSize: 16,
    },
    versionText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xl,
    },
  })
