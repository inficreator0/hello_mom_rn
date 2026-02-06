import * as React from "react"
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native"

export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
}

const Button = ({
  style,
  textStyle,
  variant = 'default',
  size = 'default',
  children,
  onPress,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles[`variant_${variant}` as keyof typeof styles],
        styles[`size_${size}` as keyof typeof styles],
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (typeof child === "string" || typeof child === "number") {
          return (
            <Text
              style={[
                styles.text,
                styles[`textVariant_${variant}` as keyof typeof styles],
                styles[`textSize_${size}` as keyof typeof styles],
                textStyle,
              ]}
            >
              {child}
            </Text>
          );
        }
        return child;
      })}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  variant_default: {
    backgroundColor: '#ec4899', // primary
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  variant_destructive: {
    backgroundColor: '#ef4444',
  },
  variant_outline: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
  variant_secondary: {
    backgroundColor: '#f1f5f9',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_link: {
    backgroundColor: 'transparent',
  },
  size_default: {
    height: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  size_sm: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  size_icon: {
    height: 48,
    width: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textVariant_default: {
    color: '#ffffff',
  },
  textVariant_destructive: {
    color: '#ffffff',
  },
  textVariant_outline: {
    color: '#0f172a',
  },
  textVariant_secondary: {
    color: '#0f172a',
  },
  textVariant_ghost: {
    color: '#0f172a',
  },
  textVariant_link: {
    color: '#ec4899',
    textDecorationLine: 'underline',
  },
  textSize_default: {
    fontSize: 16,
  },
  textSize_sm: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 18,
  },
  textSize_icon: {
    fontSize: 16,
  },
})

export { Button }

