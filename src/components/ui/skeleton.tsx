import * as React from "react"
import { View, Animated, Easing, StyleSheet, ViewStyle } from "react-native"

function Skeleton({
    style,
    ...props
}: { style?: ViewStyle | ViewStyle[] }) {
    const pulseAnim = React.useRef(new Animated.Value(0.4)).current

    React.useEffect(() => {
        const pulse = Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 0.4,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])

        Animated.loop(pulse).start()
    }, [])

    return (
        <Animated.View
            style={[styles.skeleton, { opacity: pulseAnim }, style]}
            {...props}
        />
    )
}

function StatCardSkeleton() {
    return (
        <View style={styles.statCard}>
            <Skeleton style={{ height: 16, width: 64, marginBottom: 8 }} />
            <Skeleton style={{ height: 28, width: 40 }} />
        </View>
    )
}

function PostCardSkeleton() {
    return (
        <View style={styles.postCard}>
            <View style={styles.flexRowCenter}>
                <Skeleton style={{ height: 40, width: 40, borderRadius: 20 }} />
                <View style={[styles.flex1, { gap: 8, marginLeft: 12 }]}>
                    <Skeleton style={{ height: 16, width: 96 }} />
                    <Skeleton style={{ height: 12, width: 64 }} />
                </View>
                <Skeleton style={{ height: 24, width: 64, borderRadius: 12 }} />
            </View>
            <Skeleton style={{ height: 20, width: '75%', marginTop: 12 }} />
            <View style={{ gap: 8, marginTop: 12 }}>
                <Skeleton style={{ height: 16, width: '100%' }} />
                <Skeleton style={{ height: 16, width: '91.666667%' }} />
                <Skeleton style={{ height: 16, width: '66.666667%' }} />
            </View>
            <View style={[styles.flexRowCenter, { gap: 16, paddingTop: 8 }]}>
                <Skeleton style={{ height: 32, width: 80 }} />
                <Skeleton style={{ height: 32, width: 80 }} />
            </View>
        </View>
    )
}

function ProfileCardSkeleton() {
    return (
        <View style={styles.profileCard}>
            <View style={[styles.flexRow, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                <Skeleton style={{ height: 24, width: 96 }} />
                <Skeleton style={{ height: 32, width: 64 }} />
            </View>
            <View style={{ gap: 8, marginTop: 8 }}>
                <Skeleton style={{ height: 16, width: '100%' }} />
                <Skeleton style={{ height: 16, width: '80%' }} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    skeleton: {
        borderRadius: 6,
        backgroundColor: '#f1f5f9', // muted
    },
    statCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.6)',
        padding: 24,
        alignItems: 'center',
    },
    postCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.6)',
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        width: '100%',
    },
    profileCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.6)',
        padding: 24,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    flexRow: {
        flexDirection: 'row',
    },
    flexRowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flex1: {
        flex: 1,
    },
})

export { Skeleton, StatCardSkeleton, PostCardSkeleton, ProfileCardSkeleton }
