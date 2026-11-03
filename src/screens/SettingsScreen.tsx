import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native'
import Constants from 'expo-constants'
import { useTheme } from '../theme/ThemeContext'
import { useSettingsStore } from '../store/useSettingsStore'
import { SettingsRow } from '../components/ui/SettingsRow'
import { SPACING, TYPOGRAPHY, ThemeColors } from '../theme'

interface SettingsScreenProps {
  onBack: () => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, toggleTheme, colors } = useTheme()
  const { notificationsEnabled, toggleNotifications } = useSettingsStore()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
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

        <SettingsRow
          icon='moon-outline'
          title='Темная тема'
          value={theme === 'dark'}
          onToggle={toggleTheme}
        />

        <Text style={styles.sectionTitle}>О приложении</Text>

        <SettingsRow
          icon='shield-checkmark-outline'
          title='Политика конфиденциальности'
          onPress={() =>
            Linking.openURL('https://nikolyovin.github.io/photo-detox-privacy/')
          } // Пока используем старую ссылку
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
    backBtn: { width: 80 },
    backText: { fontSize: 18, color: colors.primary, fontWeight: '500' },
    headerTitle: { ...TYPOGRAPHY.title, color: colors.textMain, fontSize: 22 },
    placeholder: { width: 80 },
    content: { paddingHorizontal: SPACING.lg },
    sectionTitle: {
      ...TYPOGRAPHY.subtitle,
      color: colors.textSecondary,
      fontSize: 14,
      textTransform: 'uppercase',
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    versionText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xl,
    },
  })
