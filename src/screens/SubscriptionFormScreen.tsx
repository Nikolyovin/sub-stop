import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  BackHandler,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { useSubscriptionForm } from '../hooks/useSubscriptionForm'
import { InputField } from '../components/ui/InputField'
import { CycleSelector } from '../components/ui/CycleSelector'
import { CategorySelector } from '../components/ui/CategorySelector'
import { HeaderBackButton } from '../components/ui/HeaderBackButton'
import { BrandPickerSheet } from '../components/BrandPickerSheet'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, ThemeColors } from '../theme'
import { useTheme } from '../theme/ThemeContext'
import { Subscription } from '../types'

interface SubscriptionFormScreenProps {
  onBack: () => void
  initialData?: Subscription
  focusField?: 'note'
}

const getCurrencySymbol = (curr: string) => {
  if (curr === 'USD') return '$'
  if (curr === 'EUR') return '€'
  return '₽'
}

export const SubscriptionFormScreen: React.FC<SubscriptionFormScreenProps> = ({
  onBack,
  initialData,
  focusField,
}) => {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const bottomSheetRef = useRef<{ open: () => void }>(null)
  const noteInputRef = useRef<any>(null)
  const scrollViewRef = useRef<any>(null)

  const form = useSubscriptionForm(onBack, initialData)

  const handleBack = useCallback(() => {
    if (!form.hasChanges) {
      onBack()
      return
    }
    Alert.alert('Выйти без сохранения?', 'Введенные данные не сохранятся.', [
      { text: 'Остаться', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: onBack },
    ])
  }, [form.hasChanges, onBack])

  useEffect(() => {
    const backAction = () => {
      handleBack()
      return true
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    )
    return () => backHandler.remove()
  }, [handleBack])

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height)
      if (noteInputRef.current?.isFocused()) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  useEffect(() => {
    if (focusField === 'note') {
      const timer = setTimeout(() => {
        noteInputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [focusField])

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (date) form.setDate(date)
  }

  const handlePriceChange = (text: string, setter: (val: string) => void) => {
    let cleaned = text.replace(/,/g, '.').replace(/[^0-9.]/g, '')
    const dotIndex = cleaned.indexOf('.')
    if (dotIndex !== -1) {
      cleaned =
        cleaned.slice(0, dotIndex + 1) +
        cleaned.slice(dotIndex + 1).replace(/\./g, '')
    }
    const [intPart, decPart] = cleaned.split('.')
    const limitedInt = intPart ? intPart.slice(0, 7) : ''
    const limitedDec = decPart ? decPart.slice(0, 2) : ''
    if (cleaned.includes('.')) setter(`${limitedInt}.${limitedDec}`)
    else setter(limitedInt)
  }

  const CurrencyToggle = () => (
    <View style={styles.currencyToggle}>
      {(['RUB', 'USD', 'EUR'] as const).map((curr) => (
        <TouchableOpacity
          key={curr}
          style={[
            styles.currBtn,
            form.currency === curr && styles.currBtnActive,
          ]}
          onPress={() => form.setCurrency(curr)}
        >
          <Text
            style={[
              styles.currText,
              form.currency === curr && styles.currTextActive,
            ]}
          >
            {getCurrencySymbol(curr)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>
          {form.isEditing ? 'Редактирование' : 'Новая подписка'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.form,
            {
              paddingBottom: SPACING.md,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          alwaysBounceVertical={false}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Название</Text>
            <TouchableOpacity
              style={styles.selectorInput}
              onPress={() => bottomSheetRef.current?.open()}
              activeOpacity={0.7}
            >
              <Text
                style={
                  form.name
                    ? styles.selectorTextActive
                    : styles.selectorTextPlaceholder
                }
              >
                {form.name || 'Выберите или введите название'}
              </Text>
              <Ionicons
                name='chevron-down'
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Статус</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                form.status === 'active' && styles.segmentBtnActive,
              ]}
              onPress={() => form.setStatus('active')}
            >
              <Text
                style={
                  form.status === 'active'
                    ? styles.segmentTextActive
                    : styles.segmentText
                }
              >
                Платно
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                form.status === 'trial' && styles.segmentBtnActive,
              ]}
              onPress={() => form.setStatus('trial')}
            >
              <Text
                style={
                  form.status === 'trial'
                    ? styles.segmentTextActive
                    : styles.segmentText
                }
              >
                Триал
              </Text>
            </TouchableOpacity>
          </View>

          <InputField
            label={
              form.status === 'trial' ? 'Стоимость во время промо' : 'Стоимость'
            }
            value={form.price}
            onChangeText={(text) => handlePriceChange(text, form.setPrice)}
            placeholder='0'
            keyboardType='decimal-pad'
            rightElement={<CurrencyToggle />}
            error={
              form.price.length > 0 && isNaN(Number(form.price))
                ? 'Введите число'
                : undefined
            }
          />

          {form.status === 'trial' && (
            <InputField
              label='Стоимость после окончания'
              value={form.regularPrice}
              onChangeText={(text) =>
                handlePriceChange(text, form.setRegularPrice)
              }
              placeholder='0' // 🚀 Было: 'Например, 599'
              keyboardType='decimal-pad'
              rightElement={<CurrencyToggle />}
              error={
                form.regularPrice.length > 0 && isNaN(Number(form.regularPrice))
                  ? 'Введите число'
                  : undefined
              }
            />
          )}

          <Text style={styles.label}>Периодичность</Text>
          <CycleSelector value={form.cycle} onChange={form.setCycle} />

          <Text style={styles.label}>
            {form.status === 'trial' ? 'Конец триала' : 'Дата списания'}
          </Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {format(form.date, 'dd.MM.yyyy')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={form.date}
              mode='date'
              display='default'
              onValueChange={onDateChange}
              onDismiss={() => setShowDatePicker(false)}
              minimumDate={new Date()}
            />
          )}

          <CategorySelector
            selected={form.category}
            onSelect={form.setCategory}
          />

          <Text style={styles.label}>Заметка (необязательно)</Text>
          <TextInput
            ref={noteInputRef}
            style={[styles.dateInput, styles.noteInput]}
            placeholder='Например, аккаунт или когда отменить'
            placeholderTextColor={colors.textSecondary}
            value={form.note}
            onChangeText={form.setNote}
            maxLength={100}
            returnKeyType='done'
            onSubmitEditing={() => Keyboard.dismiss()}
            onFocus={() => {
              if (Platform.OS === 'android')
                setTimeout(
                  () => scrollViewRef.current?.scrollToEnd({ animated: true }),
                  300,
                )
            }}
          />
        </ScrollView>

        <View
          style={[
            styles.bottomButtonContainer,
            keyboardHeight > 0 && { marginBottom: keyboardHeight },
          ]}
        >
          <TouchableOpacity
            style={[styles.saveBtn, !form.isValid && styles.saveBtnDisabled]}
            onPress={form.save}
            disabled={!form.isValid}
          >
            <Text style={styles.saveBtnText}>
              {form.isEditing ? 'Сохранить изменения' : 'Добавить'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BrandPickerSheet
        ref={bottomSheetRef}
        onSelect={(name) => form.setName(name)}
        onClose={() => {}}
      />
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
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      ...TYPOGRAPHY.title,
      color: colors.textMain,
      fontSize: 22,
    },
    placeholder: { width: 44 },

    form: { paddingHorizontal: SPACING.lg },

    label: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: SPACING.sm,
    },
    inputGroup: { marginBottom: 0 },

    selectorInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      height: 48,
    },
    selectorTextPlaceholder: { fontSize: 16, color: colors.textSecondary },
    selectorTextActive: {
      fontSize: 16,
      color: colors.textMain,
      fontWeight: '500',
    },

    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.sm,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: BORDER_RADIUS.md - 4,
      alignItems: 'center',
    },
    segmentBtnActive: { backgroundColor: colors.primary },
    segmentText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    segmentTextActive: { color: colors.white, fontWeight: 'bold' },

    currencyToggle: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.sm,
      padding: 2,
    },
    currBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BORDER_RADIUS.sm - 2,
    },
    currBtnActive: { backgroundColor: colors.primary },
    currText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    currTextActive: { color: '#FFF' },

    dateInput: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.sm,
      height: 48,
      justifyContent: 'center',
    },
    dateText: { fontSize: 16, color: colors.textMain },
    noteInput: {
      height: 48,
      textAlignVertical: 'center',
      fontSize: 16,
      color: colors.textMain,
    },

    bottomButtonContainer: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: colors.background,
    },

    saveBtn: {
      backgroundColor: colors.primary,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { ...TYPOGRAPHY.button, color: colors.white, fontSize: 18 },
  })
