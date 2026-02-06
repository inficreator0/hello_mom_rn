import * as React from "react"
import { Modal, View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native"
import { X } from "lucide-react-native"

const Dialog = ({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) => (
  <Modal
    visible={open}
    transparent
    animationType="fade"
    onRequestClose={() => onOpenChange(false)}
  >
    <View style={styles.overlay}>
      {children}
    </View>
  </Modal>
)

const DialogContent = ({ style, children, onOpenChange }: { style?: ViewStyle | ViewStyle[], children: React.ReactNode, onOpenChange: (open: boolean) => void }) => (
  <View style={[styles.content, style]}>
    {children}
    <Pressable
      onPress={() => onOpenChange(false)}
      style={styles.closeButton}
    >
      <X size={20} color="#64748b" />
    </Pressable>
  </View>
)

const DialogHeader = ({ style, ...props }: any) => (
  <View style={[styles.header, style]} {...props} />
)

const DialogFooter = ({ style, ...props }: any) => (
  <View style={[styles.footer, style]} {...props} />
)

const DialogTitle = ({ style, ...props }: any) => (
  <Text style={[styles.title, style]} {...props} />
)

const DialogDescription = ({ style, ...props }: any) => (
  <Text style={[styles.description, style]} {...props} />
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#ffffff', // card
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0', // border
    position: 'relative',
  },
  header: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a', // foreground
  },
  description: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  }
})

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

