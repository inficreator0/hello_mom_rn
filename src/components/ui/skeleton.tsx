import * as React from "react"
import { View, Animated, Easing, StyleSheet, ViewStyle, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window");

function Skeleton({
    style,
    ...props
}: { style?: ViewStyle | ViewStyle[] }) {
    const shimmerAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        const shimmer = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        )
        shimmer.start()

        return () => shimmer.stop()
    }, [])

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    })

    return (
        <View style={[styles.skeleton, style, { overflow: 'hidden' }]} {...props}>
            <Animated.View style={{ ...StyleSheet.absoluteFillObject, transform: [{ translateX }] }}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
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

function ArticleCardSkeleton() {
    return (
        <View style={styles.postCard}>
            {/* Image Placeholder */}
            <Skeleton style={{ height: 160, width: '100%', borderRadius: 8, marginBottom: 16 }} />

            {/* Title and Meta */}
            <Skeleton style={{ height: 20, width: '85%', marginBottom: 8 }} />
            <Skeleton style={{ height: 12, width: '40%', marginBottom: 16 }} />

            {/* Summary preview lines */}
            <View style={{ gap: 8, marginBottom: 16 }}>
                <Skeleton style={{ height: 14, width: '100%' }} />
                <Skeleton style={{ height: 14, width: '90%' }} />
            </View>

            {/* Actions row */}
            <View style={[styles.flexRowCenter, { justifyContent: 'space-between', marginTop: 'auto' }]}>
                <Skeleton style={{ height: 40, flex: 1, marginRight: 8, borderRadius: 6 }} />
                <Skeleton style={{ height: 40, width: 40, borderRadius: 6 }} />
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

export { Skeleton, StatCardSkeleton, PostCardSkeleton, ProfileCardSkeleton, ArticleCardSkeleton }
