import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native'
import Constants from 'expo-constants'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '../theme/ThemeContext'
import { useSettingsStore } from '../store/useSettingsStore'
import { useBiometricLock } from '../hooks/useBiometricLock'
import { SettingsRow } from '../components/ui/SettingsRow'
import { HeaderBackButton } from '../components/ui/HeaderBackButton'
import { SPACING, TYPOGRAPHY, ThemeColors } from '../theme'
import {
  sendTestNotification,
  requestNotificationPermissions,
} from '../services/notificationService'

interface SettingsScreenProps {
  onBack: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, toggleTheme, colors } = useTheme()
  const [showTimePicker, setShowTimePicker] = useState(false)

  const {
    notificationsEnabled,
    toggleNotifications,
    notifyTrials,
    toggleNotifyTrials,
    notifyRegular,
    toggleNotifyRegular,
    reminderHour,
    reminderMinute,
    setReminderTime,
  } = useSettingsStore()

  const { isLockEnabled, isBiometricAvailable, toggleLock } = useBiometricLock()

  const styles = useMemo(() => createStyles(colors), [colors])

  const reminderDate = new Date()
  reminderDate.setHours(reminderHour, reminderMinute)

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false)
    if (date) setReminderTime(date.getHours(), date.getMinutes())
  }

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
        <Text style={styles.sectionTitle}>Уведомления</Text>

        <SettingsRow
          icon='notifications-outline'
          title='Уведомления'
          value={notificationsEnabled}
          onToggle={toggleNotifications}
        />

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

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeLabel}>Время напоминаний</Text>
              <Text style={styles.timeValue}>
                {reminderHour.toString().padStart(2, '0')}:
                {reminderMinute.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={reminderDate}
                mode='time'
                display='default'
                onValueChange={onTimeChange}
                onDismiss={() => setShowTimePicker(false)}
              />
            )}
          </View>
        )}

        {isBiometricAvailable && (
          <>
            <Text style={styles.sectionTitle}>Безопасность</Text>
            <SettingsRow
              icon='finger-print-outline'
              title='Вход по биометрии'
              value={isLockEnabled}
              onToggle={() => toggleLock(!isLockEnabled)}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>Основные</Text>
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
    subSettingsContainer: {
      paddingLeft: SPACING.sm,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
      marginLeft: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    timeButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: SPACING.md,
      borderRadius: 16,
      marginBottom: SPACING.sm,
    },
    timeLabel: { ...TYPOGRAPHY.body, color: colors.textMain },
    timeValue: {
      ...TYPOGRAPHY.body,
      color: colors.primary,
      fontWeight: 'bold',
    },
    testBtn: {
      backgroundColor: `${colors.primary}15`,
      padding: SPACING.md,
      borderRadius: 16,
      alignItems: 'center',
    },
    testBtnText: { ...TYPOGRAPHY.button, color: colors.primary, fontSize: 16 },
    versionText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xl,
    },
  })
