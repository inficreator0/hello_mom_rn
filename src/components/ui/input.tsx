import * as React from "react"
import { TextInput, StyleSheet, TextStyle } from "react-native"

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  style?: TextStyle | TextStyle[];
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, placeholderTextColor, ...props }, ref) => {
    return (
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor || "#94a3b8"}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const styles = StyleSheet.create({
  input: {
    height: 48,
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0', // input
    backgroundColor: '#ffffff', // background
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#0f172a', // foreground
  },
})

export { Input }

