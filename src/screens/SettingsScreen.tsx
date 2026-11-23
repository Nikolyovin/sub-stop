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
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { fetchAndSaveRates } from '../services/currencyService'
import { SPACING, TYPOGRAPHY, ThemeColors, BORDER_RADIUS } from '../theme'

const API_URL = 'https://sub-stop-server-nikolyovin.msk1.amvera.tech'

interface SettingsScreenProps {
  onBack: () => void
  onOpenPremium: () => void
}

const SettingsGroup = ({
  title,
  children,
  styles,
}: {
  title?: string
  children: React.ReactNode
  styles: any
}) => (
  <View style={styles.groupContainer}>
    {title && <Text style={styles.groupTitle}>{title}</Text>}
    <View style={styles.groupCard}>{children}</View>
  </View>
)

const SettingsItem = ({
  icon,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
  isDestructive = false,
  rightElement,
  isLoading = false,
  styles,
  colors,
}: any) => {
  return (
    <TouchableOpacity
      style={[styles.itemRow, onPress && { opacity: 0.9 }]}
      onPress={onPress || onToggle}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isDestructive
              ? `${colors.danger}15`
              : `${colors.primary}15`,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={isDestructive ? colors.danger : colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[styles.itemTitle, isDestructive && { color: colors.danger }]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {isLoading ? (
        <ActivityIndicator
          size='small'
          color={colors.primary}
          style={styles.rightElement}
        />
      ) : rightElement ? (
        <View style={styles.rightElement}>{rightElement}</View>
      ) : onToggle ? (
        <View
          style={[
            styles.toggle,
            value
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              value ? { transform: [{ translateX: 20 }] } : {},
            ]}
          />
        </View>
      ) : (
        <Ionicons
          name='chevron-forward'
          size={20}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  )
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onOpenPremium,
}) => {
  const { theme, toggleTheme, colors } = useTheme()
  const [showTimePicker, setShowTimePicker] = useState(false)

  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [restoreStep, setRestoreStep] = useState<'email' | 'code'>('email')

  const [restoreEmail, setRestoreEmail] = useState('')
  const [restoreCode, setRestoreCode] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)
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
    reset: resetSettings,
  } = useSettingsStore()
  const { isLockEnabled, reset: resetSecurity } = useSecurityStore()
  const { isBiometricAvailable, toggleLock, isCheckingHardware } =
    useBiometricLock()
  const { isPremium, setPremium, getDeviceId } = usePremiumStore()
  const { reset: resetSubscriptions } = useSubscriptionStore()

  const styles = useMemo(() => createStyles(colors), [colors])
  const isAnyNotificationEnabled = notifyTrials || notifyRegular
  const reminderDate = useMemo(() => {
    const d = new Date()
    d.setHours(reminderHour, reminderMinute)
    return d
  }, [reminderHour, reminderMinute])

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false)
    if (date) setReminderTime(date.getHours(), date.getMinutes())
  }

  const handleUpdateRates = async () => {
    setIsUpdatingRates(true)
    const success = await fetchAndSaveRates()
    setIsUpdatingRates(false)
    if (!success)
      Alert.alert('Ошибка', 'Не удалось обновить курсы. Проверьте интернет.')
  }

  const handleResetApp = async () => {
    Alert.alert(
      'Сбросить приложение?',
      'Это удалит все ваши подписки, настройки и календарь. \n\n✅ Ваш Премиум-статус будет сохранен.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentPremiumStatus = isPremium
              resetSubscriptions()
              resetSettings()
              resetSecurity()
              await AsyncStorage.multiRemove([
                'sub-stop-storage',
                'sub-stop-settings',
                '@sub_stop_security',
              ])
              setPremium(currentPremiumStatus)
              Alert.alert(
                'Готово',
                'Приложение сброшено. Премиум-статус сохранен.',
              )
              onBack()
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось сбросить данные.')
            }
          },
        },
      ],
    )
  }

  const handleDeleteAllData = () => {
    Alert.alert(
      '⚠️ Удалить аккаунт и данные?',
      'Это действие НЕОБРАТИМО.\n\n1. Все подписки будут удалены.\n2. Данные о покупке (Email, Device ID) будут навсегда удалены с нашего сервера в соответствии с 152-ФЗ.\n\n❌ Вы НЕ сможете автоматически восстановить Премиум-статус в будущем.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Да, удалить всё',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/api/delete-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device_id: getDeviceId() }),
              })
              resetSubscriptions()
              resetSettings()
              resetSecurity()
              await AsyncStorage.clear()
              setPremium(false)
              Alert.alert(
                'Готово',
                'Все данные удалены. Приложение будет закрыто.',
                [{ text: 'ОК', onPress: () => onBack() }],
              )
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось связаться с сервером.')
            }
          },
        },
      ],
    )
  }

  const handleRequestCode = async () => {
    if (!restoreEmail.includes('@')) {
      Alert.alert('Ошибка', 'Введите корректный Email')
      return
    }
    setIsRestoring(true)
    try {
      const response = await fetch(`${API_URL}/api/request-recovery-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: restoreEmail }),
      })
      const data = await response.json()
      if (response.ok) {
        setRestoreStep('code')
      } else {
        Alert.alert('Ошибка', data.error || 'Не удалось отправить код.')
      }
    } catch (error: any) {
      Alert.alert('Ошибка', 'Не удалось связаться с сервером.')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreCode || restoreCode.length !== 4) {
      Alert.alert('Ошибка', 'Введите 4-значный код из письма')
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
          code: restoreCode,
        }),
      })
      const data = await response.json()

      if (!response.ok)
        throw new Error(data.error || `Ошибка сервера: ${response.status}`)

      if (data.isPremium) {
        setPremium(true)
        closeRestoreModal()
        Alert.alert('🎉 Успех', 'Покупка восстановлена! Премиум снова активен.')
      } else {
        Alert.alert(
          'Не найдено',
          data.message || 'Покупок с таким email не найдено.',
        )
      }
    } catch (error: any) {
      console.error('Ошибка восстановления:', error)
      Alert.alert('Ошибка', error.message || 'Не удалось связаться с сервером.')
    } finally {
      setIsRestoring(false)
    }
  }

  const closeRestoreModal = () => {
    setShowRestoreModal(false)
    setRestoreStep('email')
    setRestoreEmail('')
    setRestoreCode('')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsGroup title='Основные' styles={styles}>
          <SettingsItem
            icon='moon-outline'
            title='Темная тема'
            value={theme === 'dark'}
            onToggle={toggleTheme}
            styles={styles}
            colors={colors}
          />
          {(isBiometricAvailable || isCheckingHardware) && (
            <SettingsItem
              icon='finger-print-outline'
              title='Вход по биометрии'
              value={isLockEnabled}
              onToggle={() => toggleLock(!isLockEnabled)}
              isLoading={isCheckingHardware}
              styles={styles}
              colors={colors}
            />
          )}
        </SettingsGroup>

        <SettingsGroup title='Уведомления' styles={styles}>
          <SettingsItem
            icon='time-outline'
            title='Обычные подписки'
            value={notifyRegular}
            onToggle={toggleNotifyRegular}
            styles={styles}
            colors={colors}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon='alert-circle-outline'
            title='Пробные периоды (Триалы)'
            value={notifyTrials}
            onToggle={toggleNotifyTrials}
            styles={styles}
            colors={colors}
          />
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.customItemRow}
            onPress={() => isAnyNotificationEnabled && setShowTimePicker(true)}
            disabled={!isAnyNotificationEnabled}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name='alarm-outline'
                size={20}
                color={
                  isAnyNotificationEnabled
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.itemTitle,
                  !isAnyNotificationEnabled && { color: colors.textSecondary },
                ]}
              >
                Время напоминаний
              </Text>
            </View>
            <Text
              style={[
                styles.itemValue,
                !isAnyNotificationEnabled && { color: colors.textSecondary },
              ]}
            >
              {reminderHour.toString().padStart(2, '0')}:
              {reminderMinute.toString().padStart(2, '0')}
            </Text>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </SettingsGroup>

        {showTimePicker && (
          <DateTimePicker
            value={reminderDate}
            mode='time'
            display='default'
            onValueChange={onTimeChange}
            onDismiss={() => setShowTimePicker(false)}
          />
        )}

        <SettingsGroup title='Финансы и данные' styles={styles}>
          <SettingsItem
            icon='refresh-outline'
            title='Курсы валют'
            subtitle={`USD: ${usdRate.toFixed(2)} ₽ • EUR: ${eurRate.toFixed(2)} ₽`}
            onPress={handleUpdateRates}
            isLoading={isUpdatingRates}
            styles={styles}
            colors={colors}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={isPremium ? 'star' : 'star-outline'}
            title={isPremium ? 'Премиум активен' : 'Купить Премиум'}
            onPress={onOpenPremium}
            rightElement={
              isPremium ? (
                <Text style={styles.activeBadge}>Активен</Text>
              ) : undefined
            }
            styles={styles}
            colors={colors}
          />

          {/* 🚀 СКРЫВАЕМ ВОССТАНОВЛЕНИЕ, ЕСЛИ ПРЕМИУМ УЖЕ АКТИВЕН */}
          {!isPremium && (
            <>
              <View style={styles.divider} />
              <SettingsItem
                icon='download-outline'
                title='Восстановить покупку'
                subtitle='Если сменили устройство'
                onPress={() => setShowRestoreModal(true)}
                styles={styles}
                colors={colors}
              />
            </>
          )}
        </SettingsGroup>

        <SettingsGroup title='Управление данными' styles={styles}>
          <SettingsItem
            icon='trash-outline'
            title='Сбросить приложение'
            subtitle='Удалить подписки, сохранить Премиум'
            onPress={handleResetApp}
            styles={styles}
            colors={colors}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon='close-circle-outline'
            title='Удалить аккаунт и данные'
            subtitle='Полное удаление с сервера (152-ФЗ)'
            isDestructive
            onPress={handleDeleteAllData}
            styles={styles}
            colors={colors}
          />
        </SettingsGroup>

        <SettingsGroup title='О приложении' styles={styles}>
          <SettingsItem
            icon='shield-checkmark-outline'
            title='Политика конфиденциальности'
            onPress={() =>
              Linking.openURL('https://nikolyovin.github.io/sub-stop-privacy/')
            }
            styles={styles}
            colors={colors}
          />
        </SettingsGroup>

        <Text style={styles.versionText}>
          Версия {Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </ScrollView>

      <Modal visible={showRestoreModal} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {restoreStep === 'email'
                ? 'Восстановление покупки'
                : 'Введите код'}
            </Text>

            {restoreStep === 'email' ? (
              <>
                <Text style={styles.modalDesc}>
                  Введите Email, который вы указывали при покупке Премиума. Мы
                  отправим на него код подтверждения.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder='example@mail.com'
                  placeholderTextColor={colors.textSecondary}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  value={restoreEmail}
                  onChangeText={setRestoreEmail}
                  editable={!isRestoring}
                />
              </>
            ) : (
              <>
                <Text style={styles.modalDesc}>
                  Мы отправили 4-значный код на{' '}
                  <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                    {restoreEmail}
                  </Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      textAlign: 'center',
                      fontSize: 24,
                      letterSpacing: 8,
                      fontWeight: 'bold',
                    },
                  ]}
                  placeholder='0000'
                  placeholderTextColor={colors.textSecondary}
                  keyboardType='number-pad'
                  maxLength={4}
                  value={restoreCode}
                  onChangeText={setRestoreCode}
                  editable={!isRestoring}
                />
                <TouchableOpacity
                  onPress={() => setRestoreStep('email')}
                  style={{
                    alignSelf: 'center',
                    marginTop: -8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    Изменить почту
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.modalActions}>
              {restoreStep === 'email' ? (
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={handleRequestCode}
                  disabled={isRestoring}
                  activeOpacity={0.8}
                >
                  {isRestoring ? (
                    <ActivityIndicator color='#fff' />
                  ) : (
                    <Text style={styles.modalBtnText}>Отправить код</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.accent }]}
                  onPress={handleRestore}
                  disabled={isRestoring}
                  activeOpacity={0.8}
                >
                  {isRestoring ? (
                    <ActivityIndicator color='#fff' />
                  ) : (
                    <Text style={styles.modalBtnText}>
                      Восстановить Премиум
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closeRestoreModal}
                disabled={isRestoring}
              >
                <Text style={styles.cancelBtnText}>Отмена</Text>
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
      marginBottom: SPACING.sm,
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    headerTitle: { ...TYPOGRAPHY.title, color: colors.textMain, fontSize: 20 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    groupContainer: { marginBottom: SPACING.lg },
    groupTitle: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: 6,
      marginLeft: 4,
      fontWeight: '600',
    },
    groupCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: SPACING.md,
    },
    customItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: SPACING.md,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.md,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    textContainer: { flex: 1 },
    itemTitle: {
      ...TYPOGRAPHY.body,
      color: colors.textMain,
      fontSize: 15,
      fontWeight: '500',
    },
    itemSubtitle: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginTop: 2,
      fontSize: 12,
    },
    itemValue: {
      ...TYPOGRAPHY.body,
      color: colors.primary,
      fontWeight: '600',
      marginRight: 8,
    },
    rightElement: { marginLeft: 'auto' },
    activeBadge: {
      backgroundColor: `${colors.accent}20`,
      color: colors.accent,
      fontSize: 12,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    toggle: {
      width: 44,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      padding: 2,
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    versionText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.md,
      marginBottom: SPACING.xl,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.xl,
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
      marginBottom: SPACING.lg,
      fontSize: 14,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      fontSize: 16,
      color: colors.textMain,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
    },
    modalActions: {
      flexDirection: 'column',
      gap: SPACING.md,
      marginTop: SPACING.sm,
    },
    modalBtn: {
      width: '100%',
      minHeight: 52,
      paddingVertical: 14,
      borderRadius: BORDER_RADIUS.round,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    cancelBtn: { paddingVertical: 12, alignItems: 'center' },
    cancelBtnText: {
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 15,
    },
  })
