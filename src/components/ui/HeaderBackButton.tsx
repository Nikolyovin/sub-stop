import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme/ThemeContext'

interface HeaderBackButtonProps {
  onPress: () => void
}

export const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({ onPress }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity onPress={onPress} style={styles.button} activeOpacity={0.7}>
      <Ionicons name="arrow-back" size={24} color={colors.primary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start', // Прижимаем влево
  },
})