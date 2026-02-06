import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { Heart } from 'lucide-react-native';

interface AnimatedHeartProps {
    size?: number;
    color?: string;
    fill?: string;
}

export const AnimatedHeart = ({ size = 40, color = "#ec4899", fill = "#ec4899" }: AnimatedHeartProps) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rippleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Beating Animation (Pulsing)
        const beatAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.15,
                    duration: 400,
                    easing: Easing.bezier(0.42, 0, 0.58, 1),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.bezier(0.42, 0, 0.58, 1),
                    useNativeDriver: true,
                }),
                Animated.delay(600),
            ])
        );

        // Ripple Animation (Aura)
        const rippleAnimation = Animated.loop(
            Animated.timing(rippleAnim, {
                toValue: 1,
                duration: 1300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            })
        );

        beatAnimation.start();
        rippleAnimation.start();

        return () => {
            beatAnimation.stop();
            rippleAnimation.stop();
        };
    }, []);

    const rippleScale = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.5],
    });

    const rippleOpacity = rippleAnim.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: [0, 0.25, 0],
    });

    return (
        <View style={styles.container}>
            {/* Ripple layers */}
            <Animated.View
                style={[
                    styles.ripple,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                        transform: [{ scale: rippleScale }],
                        opacity: rippleOpacity,
                    },
                ]}
            />

            {/* Beating Heart Icon */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Heart size={size} color={color} fill={fill} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ripple: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(236, 72, 153, 0.1)',
    },
});
