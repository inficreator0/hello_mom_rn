import * as React from "react"
import { View, Text, Pressable, Modal, StyleSheet, ViewStyle, TextStyle } from "react-native"
import { X } from "lucide-react-native"

const SheetContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
}>({ open: false, onOpenChange: () => { } })

const Sheet = ({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) => {
    return (
        <SheetContext.Provider value={{ open, onOpenChange }}>
            {children}
        </SheetContext.Provider>
    )
}

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    const { onOpenChange } = React.useContext(SheetContext)
    return (
        <Pressable onPress={() => onOpenChange(true)}>
            {children}
        </Pressable>
    )
}

const SheetClose = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    const { onOpenChange } = React.useContext(SheetContext)
    return (
        <Pressable onPress={() => onOpenChange(false)}>
            {children}
        </Pressable>
    )
}

const SheetPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>

const SheetOverlay = ({ style }: { style?: ViewStyle | ViewStyle[] }) => {
    const { onOpenChange } = React.useContext(SheetContext)
    return (
        <Pressable
            style={[styles.overlay, style]}
            onPress={() => onOpenChange(false)}
        />
    )
}

const SheetContent = ({ style, children, ...props }: { style?: ViewStyle | ViewStyle[], children: React.ReactNode }) => {
    const { open, onOpenChange } = React.useContext(SheetContext)

    return (
        <Modal
            visible={open}
            transparent
            animationType="slide"
            onRequestClose={() => onOpenChange(false)}
        >
            <View style={styles.container}>
                <SheetOverlay />
                <View style={[styles.content, style]} {...props}>
                    <View style={styles.handle} />
                    {children}
                    <Pressable
                        onPress={() => onOpenChange(false)}
                        style={styles.closeButton}
                    >
                        <X size={16} color="#64748b" />
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

const SheetHeader = ({ style, ...props }: any) => (
    <View style={[styles.header, style]} {...props} />
)

const SheetFooter = ({ style, ...props }: any) => (
    <View style={[styles.footer, style]} {...props} />
)

const SheetTitle = ({ style, ...props }: any) => (
    <Text style={[styles.title, style]} {...props} />
)

const SheetDescription = ({ style, ...props }: any) => (
    <Text style={[styles.description, style]} {...props} />
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        backgroundColor: '#ffffff', // background
        padding: 16,
        paddingTop: 8, // Reduced to accommodate handle
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        minHeight: 300,
        width: '100%',
    },
    handle: {
        alignSelf: 'center',
        width: 48,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#f1f5f9', // muted
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'column',
        gap: 8,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 16,
        paddingBottom: 16, // Add padding for safe area
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
        top: 20,
    }
})

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
