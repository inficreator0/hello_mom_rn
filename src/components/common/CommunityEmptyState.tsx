import { View, Text, StyleSheet } from "react-native";
import { Button } from "../ui/button";
import { Plus } from "lucide-react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface CommunityEmptyStateProps {
    onAction?: () => void;
    actionLabel?: string;
    onReset?: () => void;
}

export const CommunityEmptyState = ({ onAction, actionLabel = "Create Post", onReset }: CommunityEmptyStateProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.illustrationWrapper}>
                <Svg
                    width={200}
                    height={200}
                    viewBox="0 0 200 200"
                >
                    <Circle cx="100" cy="100" r="90" fill="white" fillOpacity={0.5} />

                    {/* Abstract curve background */}
                    <Path
                        d="M30 100C30 61.34 61.34 30 100 30C138.66 30 170 61.34 170 100"
                        stroke="#fbcfe8"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    {/* Woman Silhouette */}
                    {/* Head */}
                    <Circle cx="100" cy="70" r="20" fill="#db2777" />
                    {/* Hair bun */}
                    <Circle cx="115" cy="65" r="10" fill="#db2777" />

                    {/* Body */}
                    <Path
                        d="M50 180 C50 130, 70 100, 100 100 C 130 100, 150 130, 150 180"
                        fill="#f472b6"
                    />

                    {/* Arms holding baby */}
                    <Path
                        d="M60 140 Q 90 160 120 140"
                        stroke="#be185d"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Baby Head */}
                    <Circle cx="110" cy="120" r="14" fill="#fbcfe8" />
                </Svg>
            </View>

            <Text style={styles.title}>
                Share the first smile!
            </Text>
            <Text style={styles.description}>
                "Your voice matters here. Share your journey, ask questions, or inspire others with your story today."
            </Text>

            <View style={styles.actionsContainer}>
                {onReset && (
                    <Button variant="outline" onPress={onReset}>
                        Reset Filters
                    </Button>
                )}
                {onAction && (
                    <Button onPress={onAction}>
                        <Plus size={16} color="white" style={styles.actionIcon} />
                        {actionLabel}
                    </Button>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(226, 232, 240, 0.6)', // border/60
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // card/30
        marginHorizontal: 16,
    },
    illustrationWrapper: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0f172a', // foreground
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        color: '#64748b', // muted-foreground
        textAlign: 'center',
        marginBottom: 32,
        marginHorizontal: 'auto',
        lineHeight: 22,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    actionIcon: {
        marginRight: 8,
    },
});
