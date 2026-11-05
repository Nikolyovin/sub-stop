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

  // Достаем все нужные настройки из стора
  const {
    notificationsEnabled,
    toggleNotifications,
    notificationDaysBefore,
    setNotificationDaysBefore,
  } = useSettingsStore()

  const styles = useMemo(() => createStyles(colors), [colors])

  // Функция для тестового уведомления
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
        {/* Секция: Основные */}
        <Text style={styles.sectionTitle}>Основные</Text>

        <SettingsRow
          icon='notifications-outline'
          title='Уведомления'
          value={notificationsEnabled}
          onToggle={toggleNotifications}
        />

        {/* Показываем выбор дней только если уведомления включены */}
        {notificationsEnabled && (
          <View style={styles.daysContainer}>
            <Text style={styles.daysLabel}>За сколько дней напоминать?</Text>
            <View style={styles.pillsContainer}>
              {[1, 2, 3, 5, 7].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.pill,
                    notificationDaysBefore === days && styles.pillActive,
                  ]}
                  onPress={() => setNotificationDaysBefore(days)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      notificationDaysBefore === days && styles.pillTextActive,
                    ]}
                  >
                    {days} дн.
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <SettingsRow
          icon='moon-outline'
          title='Темная тема'
          value={theme === 'dark'}
          onToggle={toggleTheme}
        />

        {/* Секция: Тестирование */}
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

        {/* Секция: О приложении */}
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
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    placeholder: { width: 44 }, // Ширина под размер кнопки назад
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
    // Стили для выбора дней
    daysContainer: {
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: 16,
      marginBottom: SPACING.sm,
    },
    daysLabel: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    pillsContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    pill: {
      flex: 1,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: colors.background,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    pillText: { ...TYPOGRAPHY.body, color: colors.textMain, fontSize: 14 },
    pillTextActive: { color: colors.white, fontWeight: 'bold' },
    // Стиль для кнопки тестирования
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
