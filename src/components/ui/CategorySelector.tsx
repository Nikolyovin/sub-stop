import React, { useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CATEGORIES, Category } from '../../types'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../theme'

interface CategorySelectorProps {
  selected: Category
  onSelect: (category: Category) => void
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selected,
  onSelect,
}) => {
  const styles = useMemo(() => createStyles(), [])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Категория</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.id
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
              onPress={() => onSelect(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={isActive ? COLORS.white : cat.color}
              />
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const createStyles = () =>
  StyleSheet.create({
    container: { marginBottom: SPACING.md },
    label: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginBottom: SPACING.xs,
    },
    scrollContent: { gap: SPACING.sm },
    categoryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.round,
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: SPACING.xs,
    },
    categoryBtnActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    categoryText: {
      ...TYPOGRAPHY.body,
      color: COLORS.textMain,
      fontSize: 14,
    },
    categoryTextActive: {
      color: COLORS.white,
      fontWeight: 'bold',
    },
  })
