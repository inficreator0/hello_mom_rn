import * as React from "react"
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native"

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

function Badge({ style, textStyle, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        styles[`variant_${variant}` as keyof typeof styles],
        style,
      ]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[
          textStyles.text,
          textStyles[`textVariant_${variant}` as keyof typeof textStyles],
          textStyle
        ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  variant_default: {
    borderColor: 'transparent',
    backgroundColor: '#ec4899',
  },
  variant_secondary: {
    borderColor: 'transparent',
    backgroundColor: '#f1f5f9',
  },
  variant_destructive: {
    borderColor: 'transparent',
    backgroundColor: '#ef4444',
  },
  variant_outline: {
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
})

const textStyles = StyleSheet.create({
  text: {
    fontSize: 10,
    fontWeight: '600',
  },
  textVariant_default: {
    color: '#ffffff',
  },
  textVariant_secondary: {
    color: '#0f172a',
  },
  textVariant_destructive: {
    color: '#ffffff',
  },
  textVariant_outline: {
    color: '#0f172a',
  },
})

export { Badge }

