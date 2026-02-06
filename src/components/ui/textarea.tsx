import * as React from "react"
import { TextInput, TextInputProps, StyleSheet, TextStyle } from "react-native"

export interface TextareaProps extends TextInputProps {
  style?: TextStyle | TextStyle[];
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ style, ...props }, ref) => {
    return (
      <TextInput
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[styles.textarea, style]}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

const styles = StyleSheet.create({
  textarea: {
    minHeight: 80,
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0', // input
    backgroundColor: '#ffffff', // background
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a', // foreground
  },
})

export { Textarea }

