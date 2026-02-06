import * as React from "react"
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native"

const TabsContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const Tabs = ({
  value,
  onValueChange,
  children,
  style
}: {
  value?: string,
  onValueChange?: (value: string) => void,
  children: React.ReactNode,
  style?: ViewStyle | ViewStyle[]
}) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View style={[styles.tabs, style]}>
        {children}
      </View>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef<
  View,
  { style?: ViewStyle | ViewStyle[]; children: React.ReactNode }
>(({ style, children, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.list, style]}
    {...props}
  >
    {children}
  </View>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  View,
  { style?: ViewStyle | ViewStyle[]; value: string; children: React.ReactNode }
>(({ style, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value

  return (
    <Pressable
      onPress={() => context.onValueChange?.(value)}
      style={[
        styles.trigger,
        isActive && styles.triggerActive,
        style
      ]}
      {...props}
    >
      <Text style={[
        styles.triggerText,
        isActive ? styles.triggerTextActive : styles.triggerTextInactive
      ]}>
        {children}
      </Text>
    </Pressable>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  View,
  { style?: ViewStyle | ViewStyle[]; value: string; children: React.ReactNode }
>(({ style, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (context.value !== value) return null

  return (
    <View
      ref={ref}
      style={[styles.content, style]}
      {...props}
    >
      {children}
    </View>
  )
})
TabsContent.displayName = "TabsContent"

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'column',
  },
  list: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#f1f5f9', // muted
    padding: 4,
  },
  trigger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  triggerActive: {
    backgroundColor: '#ffffff', // background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  triggerTextActive: {
    color: '#0f172a', // foreground
  },
  triggerTextInactive: {
    color: '#64748b', // muted-foreground
  },
  content: {
    marginTop: 8,
  },
})

export { Tabs, TabsList, TabsTrigger, TabsContent }

