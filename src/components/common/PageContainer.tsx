import React from 'react';
import { ViewStyle, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface PageContainerProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    edges?: Edge[];
}

export const PageContainer = ({ children, style, edges = ['top'] }: PageContainerProps) => {
    return (
        <LinearGradient
            colors={['#fbcfe8', '#fce7f3', '#ffffff']}
            style={styles.gradient}
        >
            <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
