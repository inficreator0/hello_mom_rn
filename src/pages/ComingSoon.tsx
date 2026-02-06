import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Clock } from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { SafeAreaView } from "react-native-safe-area-context";

export const ComingSoon = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const trackerName = route.params?.trackerName || "this feature";

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Back</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.iconWrapper}>
              <Clock size={64} color="#ec4899" />
            </View>
            <Text style={styles.title}>We're Working on It!</Text>
            <Text style={styles.subtitle}>
              {trackerName.charAt(0).toUpperCase() + trackerName.slice(1)} is currently under development.
            </Text>
            <Text style={styles.description}>
              We're working hard to bring you this feature soon. Check back later for updates!
            </Text>
            <Button style={styles.backButtonFull} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Back to Trackers</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)', // border/50
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#0f172a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
  },
  cardContent: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 24,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b', // muted-foreground
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  backButtonFull: {
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
