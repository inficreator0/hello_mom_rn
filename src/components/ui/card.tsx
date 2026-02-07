import * as React from "react"
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native"

const Card = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { style?: ViewStyle | ViewStyle[] }
>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.card, style]}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { style?: ViewStyle | ViewStyle[] }
>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.header, style]}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  Text,
  React.ComponentPropsWithoutRef<typeof Text> & { style?: TextStyle | TextStyle[] }
>(({ style, ...props }, ref) => (
  <Text
    ref={ref}
    style={[styles.title, style]}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  Text,
  React.ComponentPropsWithoutRef<typeof Text> & { style?: TextStyle | TextStyle[] }
>(({ style, ...props }, ref) => (
  <Text
    ref={ref}
    style={[styles.description, style]}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { style?: ViewStyle | ViewStyle[] }
>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.content, style]} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { style?: ViewStyle | ViewStyle[] }
>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.footer, style]}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#ffffff', // card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'column',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 24,
    color: '#0f172a', // foreground
  },
  description: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
})

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

