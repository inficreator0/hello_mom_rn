import * as React from "react"
import { Text, StyleSheet, TextStyle } from "react-native"

const Label = React.forwardRef<
  Text,
  React.ComponentPropsWithoutRef<typeof Text> & { style?: TextStyle | TextStyle[] }
>(({ style, ...props }, ref) => (
  <Text
    ref={ref}
    style={[styles.label, style]}
    {...props}
  />
))
Label.displayName = "Label"

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 14,
    color: '#0f172a', // foreground
    marginBottom: 6,
  },
})

export { Label }

