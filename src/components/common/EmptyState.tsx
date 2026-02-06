import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, CardContent } from "../ui/card";
import Svg, { Circle, Path, Ellipse } from "react-native-svg";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: "comments" | "posts" | "bookmarks";
}

// Baby face illustration SVG
const BabyIllustration = () => (
    <View style={styles.illustrationContainer}>
        <Svg
            width={120}
            height={120}
            viewBox="0 0 120 120"
        >
            {/* Face circle */}
            <Circle cx="60" cy="55" r="40" fill="#ec4899" fillOpacity={0.1} stroke="#ec4899" strokeWidth="2" />
            {/* Left eye */}
            <Circle cx="45" cy="50" r="5" fill="#1e293b" />
            <Circle cx="46" cy="48" r="2" fill="white" />
            {/* Right eye */}
            <Circle cx="75" cy="50" r="5" fill="#1e293b" />
            <Circle cx="76" cy="48" r="2" fill="white" />
            {/* Smile */}
            <Path d="M 45 65 Q 60 80 75 65" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Blush */}
            <Circle cx="35" cy="60" r="6" fill="#ec4899" fillOpacity={0.2} />
            <Circle cx="85" cy="60" r="6" fill="#ec4899" fillOpacity={0.2} />
            {/* Hair/bow */}
            <Path d="M 35 25 Q 60 5 85 25" stroke="#ec4899" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Speech bubble placeholder */}
            <Ellipse cx="95" cy="25" rx="18" ry="12" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
        </Svg>
    </View>
);

export const EmptyState = ({ title, description }: EmptyStateProps) => {
    return (
        <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
                <BabyIllustration />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {title}
                    </Text>
                    <Text style={styles.description}>
                        {description}
                    </Text>
                </View>
            </CardContent>
        </Card>
    );
};

const styles = StyleSheet.create({
    illustrationContainer: {
        marginBottom: 16,
    },
    card: {
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: 'rgba(226, 232, 240, 0.5)', // border/50
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // card/30
    },
    cardContent: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a', // foreground
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#64748b', // muted-foreground
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default EmptyState;
