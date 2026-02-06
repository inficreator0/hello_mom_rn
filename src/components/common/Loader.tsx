import * as React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

const Loader = ({ label = "Loading...", fullScreen = false }: LoaderProps) => {
  const content = (
    <View style={styles.loaderContent}>
      <ActivityIndicator size="large" color="#ec4899" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  loaderContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  label: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
    marginTop: 12,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#ffffff', // background
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loader;


