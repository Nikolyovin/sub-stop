import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { useAddSubscription } from '../hooks/useAddSubscription'
import { InputField } from '../components/ui/InputField'
import { CycleSelector } from '../components/ui/CycleSelector'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../theme'
import { CategorySelector } from '../components/ui/CategorySelector'

interface AddSubscriptionScreenProps {
  onBack: () => void
}

export const AddSubscriptionScreen: React.FC<AddSubscriptionScreenProps> = ({
  onBack,
}) => {
  const styles = useMemo(() => createStyles(), [])
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Подключаем наш хук с логикой
  const form = useAddSubscription(onBack)

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) form.setDate(selectedDate)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новая подписка</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Глупые компоненты получают только данные и коллбеки */}
        <InputField
          label='Название'
          value={form.name}
          onChangeText={form.setName}
          placeholder='Например, Яндекс.Плюс'
        />

        <InputField
          label='Стоимость (₽)'
          value={form.price}
          onChangeText={form.setPrice}
          placeholder='399'
          keyboardType='numeric'
        />

        <Text style={styles.label}>Периодичность</Text>
        <CycleSelector value={form.cycle} onChange={form.setCycle} />

        <CategorySelector
          selected={form.category}
          onSelect={form.setCategory}
        />

        <Text style={styles.label}>Дата следующего списания</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{format(form.date, 'dd.MM.yyyy')}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={form.date}
            mode='date'
            display='default'
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity
          style={[styles.saveBtn, !form.isValid && styles.saveBtnDisabled]}
          onPress={form.save}
          disabled={!form.isValid}
        >
          <Text style={styles.saveBtnText}>Сохранить</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    backBtn: { width: 60 },
    backText: { fontSize: 18, color: COLORS.primary, fontWeight: '500' },
    headerTitle: { ...TYPOGRAPHY.subtitle, color: COLORS.textMain },
    placeholder: { width: 60 },
    form: { paddingHorizontal: SPACING.lg },
    label: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginBottom: SPACING.xs,
    },
    dateInput: {
      backgroundColor: COLORS.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: SPACING.md,
    },
    dateText: { fontSize: 16, color: COLORS.textMain },
    saveBtn: {
      backgroundColor: COLORS.primary,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      alignItems: 'center',
      marginTop: SPACING.xl,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { ...TYPOGRAPHY.button, color: COLORS.white, fontSize: 18 },
  })
