import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput } from 'react-native';
import Svg, { G, Circle, Path, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    useAnimatedStyle,
    runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Moon, Sun } from 'lucide-react-native';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const { width } = Dimensions.get('window');
const SIZE = width * 0.8;
const CENTER = SIZE / 2;
const RADIUS = (SIZE / 2) - 60; // Reduced radius
const STROKE_WIDTH = 34; // Slightly thinner for the smaller radius

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CircularTimePickerProps {
    startTime: Date; // Bedtime
    endTime: Date;   // Wake up
    onChange: (startH: number, startM: number, endH: number, endM: number) => void;
}

export const CircularTimePicker: React.FC<CircularTimePickerProps> = ({
    startTime,
    endTime,
    onChange
}) => {
    const getMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

    const startMinutes = useSharedValue(getMinutes(startTime));
    const endMinutes = useSharedValue(getMinutes(endTime));
    const isDragging = useSharedValue(false);
    const activeHandle = useSharedValue<'start' | 'end' | null>(null);

    const angleOffset = -Math.PI / 2;
    const minutesToAngle = (mins: number) => {
        'worklet';
        return (mins / 1440) * 2 * Math.PI;
    };
    const angleToMinutes = (angle: number) => {
        'worklet';
        let normAngle = (angle - angleOffset) % (2 * Math.PI);
        if (normAngle < 0) normAngle += 2 * Math.PI;
        return Math.round((normAngle / (2 * Math.PI)) * 1440) % 1440;
    };

    // Sync props to shared values ONLY if not dragging
    React.useEffect(() => {
        if (!isDragging.value) {
            startMinutes.value = getMinutes(startTime);
            endMinutes.value = getMinutes(endTime);
        }
    }, [startTime, endTime]);

    const lastUpdate = useSharedValue(0);

    const handleUpdate = (force = false) => {
        'worklet';
        const now = Date.now();
        if (!force && now - lastUpdate.value < 16) return; // 60fps throttle
        lastUpdate.value = now;

        const startH = Math.floor(startMinutes.value / 60);
        const startM = startMinutes.value % 60;
        const endH = Math.floor(endMinutes.value / 60);
        const endM = endMinutes.value % 60;

        runOnJS(onChange)(startH, startM, endH, endM);
    };

    // Refined gesture: Global detector for the whole dial
    const gesture = Gesture.Pan()
        .onBegin((e) => {
            isDragging.value = true;
            const angle = Math.atan2(e.y - CENTER, e.x - CENTER);
            const mins = angleToMinutes(angle);

            // Calculate distance to both handles to see which one to move
            const d1 = Math.abs(mins - startMinutes.value);
            const distStart = Math.min(d1, 1440 - d1);

            const d2 = Math.abs(mins - endMinutes.value);
            const distEnd = Math.min(d2, 1440 - d2);

            if (distStart < distEnd) {
                activeHandle.value = 'start';
                startMinutes.value = mins;
            } else {
                activeHandle.value = 'end';
                endMinutes.value = mins;
            }
            handleUpdate(true);
        })
        .onUpdate((e) => {
            const angle = Math.atan2(e.y - CENTER, e.x - CENTER);
            const mins = angleToMinutes(angle);

            if (activeHandle.value === 'start') {
                startMinutes.value = mins;
            } else {
                endMinutes.value = mins;
            }
            handleUpdate();
        })
        .onFinalize(() => {
            isDragging.value = false;
            activeHandle.value = null;
            handleUpdate(true);
        });

    const animatedArcProps = useAnimatedProps(() => {
        const startAngle = minutesToAngle(startMinutes.value) + angleOffset;
        let endAngle = minutesToAngle(endMinutes.value) + angleOffset;

        if (endAngle < startAngle) {
            endAngle += 2 * Math.PI;
        }

        const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

        const startX = CENTER + RADIUS * Math.cos(startAngle);
        const startY = CENTER + RADIUS * Math.sin(startAngle);
        const endX = CENTER + RADIUS * Math.cos(endAngle);
        const endY = CENTER + RADIUS * Math.sin(endAngle);

        return {
            d: `M ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        };
    });

    const startHandleStyle = useAnimatedStyle(() => {
        const angle = minutesToAngle(startMinutes.value) + angleOffset;
        return {
            transform: [
                { translateX: CENTER + RADIUS * Math.cos(angle) - 25 },
                { translateY: CENTER + RADIUS * Math.sin(angle) - 25 },
            ],
            zIndex: activeHandle.value === 'start' ? 10 : 1,
        };
    });

    const endHandleStyle = useAnimatedStyle(() => {
        const angle = minutesToAngle(endMinutes.value) + angleOffset;
        return {
            transform: [
                { translateX: CENTER + RADIUS * Math.cos(angle) - 25 },
                { translateY: CENTER + RADIUS * Math.sin(angle) - 25 },
            ],
            zIndex: activeHandle.value === 'end' ? 10 : 1,
        };
    });

    const startTimeProps = useAnimatedProps(() => {
        const h = Math.floor(startMinutes.value / 60);
        const m = startMinutes.value % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return {
            text: `${displayH}:${m < 10 ? '0' : ''}${m} ${ampm}`,
        } as any;
    });

    const endTimeProps = useAnimatedProps(() => {
        const h = Math.floor(endMinutes.value / 60);
        const m = endMinutes.value % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return {
            text: `${displayH}:${m < 10 ? '0' : ''}${m} ${ampm}`,
        } as any;
    });

    const durationProps = useAnimatedProps(() => {
        const diff = (endMinutes.value - startMinutes.value + 1440) % 1440;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return {
            text: `${h}h ${m}m`,
        } as any;
    });

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.container}>
                <Svg width={SIZE} height={SIZE}>
                    {/* Background Track */}
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        stroke="#f1f5f9"
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                    />

                    {/* Hour Markers & Ticks */}
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i / 24) * 2 * Math.PI + angleOffset;
                        const isMajor = i % 3 === 0;
                        const tickSize = isMajor ? 10 : 5;
                        const innerR = RADIUS - STROKE_WIDTH / 2 - 5;
                        const outerR = innerR - tickSize;

                        const x1 = CENTER + innerR * Math.cos(angle);
                        const y1 = CENTER + innerR * Math.sin(angle);
                        const x2 = CENTER + outerR * Math.cos(angle);
                        const y2 = CENTER + outerR * Math.sin(angle);

                        return (
                            <React.Fragment key={i}>
                                <Line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={isMajor ? '#64748b' : '#cbd5e1'}
                                    strokeWidth={isMajor ? 2 : 1}
                                />
                                {isMajor && (
                                    <SvgText
                                        x={CENTER + (RADIUS + 40) * Math.cos(angle)}
                                        y={CENTER + (RADIUS + 40) * Math.sin(angle) + 4}
                                        fill="#94a3b8"
                                        fontSize="9"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        {i === 0 ? "12 midnight" : i === 12 ? "12 noon" : i < 12 ? `${i} AM` : `${i - 12} PM`}
                                    </SvgText>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Active Arc */}
                    <AnimatedPath
                        animatedProps={animatedArcProps}
                        stroke="url(#arcGradient)"
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                        strokeLinecap="round"
                    />
                    <Defs>
                        <LinearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0%" stopColor="#818cf8" />
                            <Stop offset="100%" stopColor="#6366f1" />
                        </LinearGradient>
                    </Defs>
                </Svg>

                {/* Handles now follow the gesture, pointerEvents disabled on them to let dial handle it */}
                <Animated.View style={[styles.handle, styles.startHandle, startHandleStyle]} pointerEvents="none">
                    <Moon size={20} color="white" />
                </Animated.View>

                <Animated.View style={[styles.handle, styles.endHandle, endHandleStyle]} pointerEvents="none">
                    <Sun size={20} color="white" />
                </Animated.View>

                {/* Center Info */}
                <View style={styles.centerInfo} pointerEvents="none">
                    <View style={styles.timeLine}>
                        <Moon size={12} color="#7c3aed" />
                        <AnimatedTextInput
                            editable={false}
                            //@ts-ignore
                            animatedProps={startTimeProps}
                            style={styles.timeInfoSmall}
                        />
                    </View>

                    <AnimatedTextInput
                        editable={false}
                        //@ts-ignore
                        animatedProps={durationProps}
                        style={styles.durationValue}
                    />
                    <Text style={styles.durationLabel}>Total Sleep</Text>

                    <View style={styles.timeLine}>
                        <Sun size={12} color="#ea580c" />
                        <AnimatedTextInput
                            editable={false}
                            //@ts-ignore
                            animatedProps={endTimeProps}
                            style={styles.timeInfoSmall}
                        />
                    </View>
                </View>
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SIZE,
        height: SIZE,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    handle: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        left: 0,
        top: 0,
    },
    startHandle: {
        backgroundColor: '#7c3aed', // Purple
    },
    endHandle: {
        backgroundColor: '#ea580c', // Orange
    },
    centerInfo: {
        position: 'absolute',
        alignItems: 'center',
    },
    durationLabel: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    durationValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        padding: 0,
        margin: 0,
    },
    timeLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeInfoSmall: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        padding: 0,
        margin: 0,
    },
});
