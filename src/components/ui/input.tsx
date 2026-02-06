import * as React from "react"
import { TextInput, StyleSheet, TextStyle, View, Pressable } from "react-native"
import { Eye, EyeOff } from "lucide-react-native"

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  style?: TextStyle | TextStyle[];
  containerStyle?: TextStyle | TextStyle[];
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, containerStyle, placeholderTextColor, onFocus, onBlur, secureTextEntry, showPasswordToggle, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
      <View style={[
        styles.container,
        isFocused && styles.containerFocused,
        containerStyle
      ]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, style]}
            placeholderTextColor={placeholderTextColor || "#94a3b8"}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            secureTextEntry={isSecure}
            ref={ref}
            {...props}
          />
          {showPasswordToggle && secureTextEntry && (
            <Pressable
              onPress={togglePasswordVisibility}
              style={styles.toggleButton}
              hitSlop={10}
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color="#64748b" />
              ) : (
                <Eye size={20} color="#64748b" />
              )}
            </Pressable>
          )}
        </View>
      </View>
    )
  }
)
Input.displayName = "Input"

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0', // input
    backgroundColor: '#ffffff', // background
    transitionProperty: 'border-color',
    transitionDuration: '200ms',
  },
  containerFocused: {
    borderColor: '#ec4899', // primary
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    height: 48,
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a', // foreground
  },
  toggleButton: {
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export { Input }

