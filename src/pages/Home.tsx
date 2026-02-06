import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Heart, Users, Activity, MessageCircle, ChevronRight } from "lucide-react-native";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const navigation = useNavigation<any>();

  const features = [
    {
      icon: Users,
      title: "Community",
      description: "Connect with other mothers, share experiences, and get support",
      action: "Explore Community",
      path: "Home", // Navigates to the Community tab in our current setup
      color: "#ec4899", // primary
      bgColor: "rgba(255, 107, 107, 0.1)", // primary/10
    },
    {
      icon: Activity,
      title: "Health Trackers",
      description: "Track baby's growth, feeding, sleep, and your recovery progress",
      action: "View Trackers",
      path: "TrackersTab",
      color: "#0f172a", // accent-foreground/foreground
      bgColor: "rgba(241, 245, 249, 1)", // accent/30 approximated to light gray
    },
    {
      icon: MessageCircle,
      title: "Consultations",
      description: "Book appointments with healthcare professionals",
      action: "Find Doctors",
      path: "ConsultTab",
      color: "#0f172a", // secondary-foreground
      bgColor: "rgba(226, 232, 240, 0.5)", // secondary/50
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrapper}>
            <Heart size={48} color="#ec4899" fill="#ec4899" />
          </View>
          <Text style={styles.heroTitle}>Hello Mom</Text>
          <Text style={styles.heroSubtitle}>
            Your supportive community for pregnancy, postpartum, and beyond
          </Text>
        </View>

        <View style={styles.featuresList}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Pressable
                key={feature.title}
                onPress={() => navigation.navigate('Main', { screen: feature.path })}
              >
                <Card style={styles.featureCard}>
                  <CardHeader style={styles.featureCardHeader}>
                    <View style={[styles.featureIconContainer, { backgroundColor: feature.bgColor }]}>
                      <Icon size={24} color={feature.color} />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <CardTitle style={styles.featureTitle}>{feature.title}</CardTitle>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <ChevronRight size={20} color="#64748b" />
                  </CardHeader>
                </Card>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.welcomeSection}>
          <Card style={styles.welcomeCard}>
            <CardHeader>
              <Text style={styles.welcomeTitle}>Welcome to Your Journey</Text>
              <Text style={styles.welcomeText}>
                Whether you're expecting, just gave birth, or navigating motherhood,
                you're not alone. Our community is here to support you every step of the way.
              </Text>
            </CardHeader>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  flex1: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroIconWrapper: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
    padding: 20,
    borderRadius: 9999,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  heroSubtitle: {
    textAlign: 'center',
    color: '#64748b', // muted-foreground
    fontSize: 18,
    paddingHorizontal: 16,
  },
  featuresList: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)', // border/50
    backgroundColor: '#ffffff', // card
    overflow: 'hidden',
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  featureIconContainer: {
    padding: 12,
    borderRadius: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
  },
  featureDescription: {
    color: '#64748b', // muted-foreground
    fontSize: 12,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)', // primary/5
    borderColor: 'rgba(255, 107, 107, 0.2)', // primary/20
    borderWidth: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#0f172a',
  },
  welcomeText: {
    textAlign: 'center',
    color: '#64748b', // muted-foreground
    lineHeight: 20,
  },
});

export default Home;

