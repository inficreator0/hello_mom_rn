import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react-native";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
// import { skipWaiting } from "../lib/serviceWorker"; // Service worker is web-only

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Service worker events are web-only. 
    // For React Native, we might use Expo Updates or similar.
    // Keeping the logic but noting it might not trigger in RN.
    const handleUpdateAvailable = () => {
      setShowPrompt(true);
    };

    // window is available in some RN environments but not all properly.
    // @ts-ignore
    if (typeof window !== 'undefined') {
      window.addEventListener("sw-update-available", handleUpdateAvailable);
    }

    return () => {
      // @ts-ignore
      if (typeof window !== 'undefined') {
        window.removeEventListener("sw-update-available", handleUpdateAvailable);
      }
    };
  }, []);

  const handleUpdate = () => {
    // skipWaiting(); // web-only
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <RefreshCw size={20} color="#ec4899" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Update Available</Text>
              <Text style={styles.description}>
                A new version of the app is available. Refresh to get the latest features and improvements.
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  size="sm"
                  onPress={handleUpdate}
                  style={styles.flex1}
                >
                  <RefreshCw size={12} color="#ffffff" style={styles.buttonIcon} />
                  Update Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleDismiss}
                >
                  <X size={12} color="#0f172a" />
                </Button>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    pointerEvents: 'box-none',
  },
  card: {
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderColor: 'rgba(255, 107, 107, 0.2)', // primary/20
  },
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: '#0f172a',
  },
  description: {
    fontSize: 12,
    color: '#64748b', // muted-foreground
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
});
