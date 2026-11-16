import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import Constants from 'expo-constants'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../theme/ThemeContext'
import { useSettingsStore } from '../store/useSettingsStore'
import { useSecurityStore } from '../store/useSecurityStore'
import { useBiometricLock } from '../hooks/useBiometricLock'
import { usePremiumStore } from '../store/usePremiumStore'
import { fetchAndSaveRates } from '../services/currencyService' // 🚀 Импорт сервиса
import { SettingsRow } from '../components/ui/SettingsRow'
import { HeaderBackButton } from '../components/ui/HeaderBackButton'
import { SPACING, TYPOGRAPHY, ThemeColors } from '../theme'

const API_URL = 'https://sub-stop-server-nikolyovin.msk1.amvera.tech'

interface SettingsScreenProps {
  onBack: () => void
  onOpenPremium: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onOpenPremium,
}) => {
  const { theme, toggleTheme, colors } = useTheme()
  const [showTimePicker, setShowTimePicker] = useState(false)

  // Стейты для модалки восстановления
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [restoreEmail, setRestoreEmail] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)

  // 🚀 Стейт для обновления курсов
  const [isUpdatingRates, setIsUpdatingRates] = useState(false)

  const {
    notifyTrials,
    toggleNotifyTrials,
    notifyRegular,
    toggleNotifyRegular,
    reminderHour,
    reminderMinute,
    setReminderTime,
    usdRate,
    eurRate,
  } = useSettingsStore()

  const { isLockEnabled } = useSecurityStore()
  const { isBiometricAvailable, toggleLock, isCheckingHardware } =
    useBiometricLock()
  const { isPremium, setPremium, getDeviceId } = usePremiumStore()

  const styles = useMemo(() => createStyles(colors), [colors])

  const isAnyNotificationEnabled = notifyTrials || notifyRegular

  const reminderDate = new Date()
  reminderDate.setHours(reminderHour, reminderMinute)

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false)
    if (date) setReminderTime(date.getHours(), date.getMinutes())
  }

  // 🚀 Функция ручного обновления курсов
  const handleUpdateRates = async () => {
    setIsUpdatingRates(true)
    const success = await fetchAndSaveRates()
    setIsUpdatingRates(false)

    if (success) {
      Alert.alert('Успех', 'Курсы валют обновлены.')
    } else {
      Alert.alert('Ошибка', 'Не удалось обновить курсы. Проверьте интернет.')
    }
  }

  // 🚀 Восстановление покупки
  const handleRestore = async () => {
    if (!restoreEmail.includes('@')) {
      Alert.alert('Ошибка', 'Введите корректный Email')
      return
    }
    setIsRestoring(true)
    try {
      const response = await fetch(`${API_URL}/api/restore-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: restoreEmail,
          new_device_id: getDeviceId(),
        }),
      })
      const data = await response.json()

      if (data.isPremium) {
        setPremium(true)
        setShowRestoreModal(false)
        Alert.alert('Успех', 'Покупка восстановлена! Премиум снова активен.')
      } else {
        Alert.alert('Не найдено', 'Покупок с таким email не найдено.')
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось связаться с сервером.')
    } finally {
      setIsRestoring(false)
    }
  }

  // 🚀 Удаление данных
  const handleDeleteData = () => {
    Alert.alert(
      'Удалить все данные?',
      'Это действие навсегда удалит ваши подписки и отвяжет Премиум-статус.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/api/delete-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device_id: getDeviceId() }),
              })

              await AsyncStorage.clear()
              setPremium(false)
              Alert.alert(
                'Готово',
                'Все данные удалены. Приложение будет перезапущено.',
              )
              onBack()
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить данные.')
            }
          },
        },
      ],
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={onBack} />
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode='never'
      >
        <Text style={styles.sectionTitle}>Основные</Text>
        <SettingsRow
          icon='moon-outline'
          title='Темная тема'
          value={theme === 'dark'}
          onToggle={toggleTheme}
        />

        {(isBiometricAvailable || isCheckingHardware) && (
          <SettingsRow
            icon='finger-print-outline'
            title='Вход по биометрии'
            value={isLockEnabled}
            onToggle={() => toggleLock(!isLockEnabled)}
            isLoading={isCheckingHardware}
          />
        )}

        <Text style={styles.sectionTitle}>Уведомления</Text>
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
          style={[
            styles.timeButton,
            !isAnyNotificationEnabled && { opacity: 0.5 },
          ]}
          onPress={() => isAnyNotificationEnabled && setShowTimePicker(true)}
          disabled={!isAnyNotificationEnabled}
        >
          <View style={styles.left}>
            <Ionicons
              name='time-outline'
              size={20}
              color={
                !isAnyNotificationEnabled
                  ? colors.textSecondary
                  : colors.primary
              }
            />
            <Text
              style={[
                styles.timeLabel,
                !isAnyNotificationEnabled && { color: colors.textSecondary },
              ]}
            >
              Время напоминаний
            </Text>
          </View>
          <Text
            style={[
              styles.timeValue,
              !isAnyNotificationEnabled && { color: colors.textSecondary },
            ]}
          >
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

        {/* 🚀 Блок с курсами и кнопкой обновления */}
        <View style={styles.rateHeader}>
          <Text
            style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}
          >
            Курсы валют
          </Text>
          <TouchableOpacity
            onPress={handleUpdateRates}
            disabled={isUpdatingRates}
          >
            {isUpdatingRates ? (
              <ActivityIndicator size='small' color={colors.primary} />
            ) : (
              <Ionicons name='refresh' size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.rateContainer}>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Доллар США (USD)</Text>
            <Text style={styles.rateValue}>{usdRate.toFixed(2)} ₽</Text>
          </View>
          <View style={styles.rateDivider} />
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Евро (EUR)</Text>
            <Text style={styles.rateValue}>{eurRate.toFixed(2)} ₽</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Поддержка</Text>
        <SettingsRow
          icon={isPremium ? 'star' : 'star-outline'}
          title={isPremium ? 'Премиум активен' : 'Премиум-версия'}
          iconColor={isPremium ? '#F59E0B' : undefined}
          onPress={onOpenPremium}
        />

        <Text style={styles.sectionTitle}>Данные</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowRestoreModal(true)}
        >
          <View style={styles.left}>
            <Ionicons name='refresh-outline' size={20} color={colors.primary} />
            <Text style={styles.timeLabel}>Восстановить покупку</Text>
          </View>
          <Ionicons
            name='chevron-forward'
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeButton, { marginTop: 4 }]}
          onPress={handleDeleteData}
        >
          <View style={styles.left}>
            <Ionicons name='trash-outline' size={20} color={colors.danger} />
            <Text style={[styles.timeLabel, { color: colors.danger }]}>
              Удалить все данные
            </Text>
          </View>
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

      {/* Модалка восстановления покупки */}
      <Modal visible={showRestoreModal} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Восстановление покупки</Text>
            <Text style={styles.modalDesc}>
              Введите Email, который вы указывали при покупке Премиума.
            </Text>

            <TextInput
              style={styles.input}
              placeholder='example@mail.com'
              placeholderTextColor={colors.textSecondary}
              keyboardType='email-address'
              autoCapitalize='none'
              value={restoreEmail}
              onChangeText={setRestoreEmail}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => setShowRestoreModal(false)}
                disabled={isRestoring}
              >
                <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>
                  Отмена
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleRestore}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Восстановить
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      height: 56,
      marginBottom: SPACING.xs,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    placeholder: { width: 44 },
    content: { paddingHorizontal: SPACING.lg },
    sectionTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textSecondary,
      fontSize: 13,
      textTransform: 'uppercase',
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },

    // 🚀 Стили для заголовка курсов с кнопкой
    rateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },

    timeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.md,
      borderRadius: 16,
      marginBottom: 6,
      height: 56,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    timeLabel: { ...TYPOGRAPHY.body, color: colors.textMain, fontSize: 15 },
    timeValue: {
      ...TYPOGRAPHY.body,
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 15,
    },

    // Карточка курсов
    rateContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: SPACING.md,
      marginBottom: 6,
    },
    rateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
    },
    rateDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    rateLabel: { ...TYPOGRAPHY.body, color: colors.textMain, fontSize: 15 },
    rateValue: {
      ...TYPOGRAPHY.body,
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 15,
    },

    versionText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.md,
      marginBottom: SPACING.lg,
    },

    // Стили модалки
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: SPACING.lg,
    },
    modalTitle: {
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 20,
      marginBottom: SPACING.xs,
      textAlign: 'center',
    },
    modalDesc: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.md,
      fontSize: 14,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: SPACING.md,
      fontSize: 16,
      color: colors.textMain,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.lg,
    },
    modalActions: { flexDirection: 'row', gap: SPACING.md },
    modalBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
