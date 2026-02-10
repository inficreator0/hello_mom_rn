import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Baby, Users, ArrowRight } from "lucide-react-native";
import { AnimatedHeart } from "../components/ui/AnimatedHeart";
import { usePreferences } from "../context/PreferencesContext";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../lib/api/auth";
import { PageContainer } from "../components/common/PageContainer";

type Gender = "female" | "male" | "other" | "prefer_not_to_say";

export const Onboarding = () => {
  const navigation = useNavigation();
  const { mode, setMode, completeOnboarding, updatePreferences } = usePreferences();
  const { checkOnboardingStatus, setIsOnboarded } = useAuth();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<"baby" | "community" | null>(mode);
  const [babyName, setBabyName] = useState("");
  const [babyStage, setBabyStage] = useState("newborn");
  const [firstTimeMom, setFirstTimeMom] = useState<"yes" | "no" | null>(null);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleNextFromBasicDetails = () => {
    if (!gender || !age.trim()) return;
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) return;
    updatePreferences({ gender, age: ageNum });
    setStep(1);
  };

  const handleNextFromPurpose = () => {
    if (!selectedPurpose) return;
    setMode(selectedPurpose);
    if (selectedPurpose === "baby") {
      setStep(2);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Map gender to backend format
      const genderMap = {
        female: "FEMALE",
        male: "MALE",
        other: "OTHER",
        prefer_not_to_say: "PREFER_NOT_TO_SAY"
      };

      // Map onboarding type to backend format
      const onboardingTypeMap = {
        pregnancy: "EXPECTING",
        general_health: "GENERAL_HEALTH"
      };

      // 1. POST API to save onboarding status with all collected data
      const onboardingType = selectedPurpose === "baby" ? "pregnancy" : "general_health";
      await authAPI.completeOnboarding({
        onboardingType: onboardingTypeMap[onboardingType as keyof typeof onboardingTypeMap],
        age: parseInt(age, 10),
        gender: gender ? genderMap[gender] : undefined
      });

      // 2. Refresh AuthContext state
      setIsOnboarded(true);
      await checkOnboardingStatus();

      // 3. Update local preferences
      updatePreferences({
        babyName: babyName || undefined,
        babyStage,
        firstTimeMom: firstTimeMom || undefined,
        focusAreas,
      });
      completeOnboarding();

      // 4. Navigate to community screen
      navigation.navigate("Community" as never);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#ec4899" size="large" />
        <Text style={styles.loadingText}>Setting up your experience...</Text>
      </View>
    );
  }

  return (
    <PageContainer style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <CardHeader style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <AnimatedHeart size={40} />
              </View>
              <CardTitle style={styles.cardTitle}>Welcome to Nova</CardTitle>
              <CardDescription>
                Let's personalize your experience in a few steps.
              </CardDescription>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              {step === 0 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepLabel}>Tell us a bit about yourself.</Text>

                  <View>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.genderRow}>
                      {(["female", "male", "other", "prefer_not_to_say"] as const).map((g) => (
                        <Pressable
                          key={g}
                          onPress={() => setGender(g)}
                          style={[
                            styles.genderChip,
                            gender === g ? styles.stageChipSelected : styles.stageChipUnselected,
                          ]}
                        >
                          <Text style={[
                            styles.stageText,
                            gender === g ? styles.stageTextSelected : styles.stageTextUnselected,
                          ]}>
                            {g === "female" ? "Female" : g === "male" ? "Male" : g === "other" ? "Other" : "Prefer not to say"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your age"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>

                  <View style={styles.footerRow}>
                    {/* <Text style={styles.stepCounter}>Step 1 of 3</Text> */}
                    <Button
                      onPress={handleNextFromBasicDetails}
                      disabled={!gender || !age.trim() || parseInt(age, 10) < 13 || parseInt(age, 10) > 120}
                      style={styles.nextButton}
                    >
                      Continue
                      <ArrowRight size={16} color="white" style={styles.buttonIcon} />
                    </Button>
                  </View>
                </View>
              )}

              {step === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepLabel}>How do you plan to use Nova?</Text>

                  <Pressable
                    onPress={() => setSelectedPurpose("baby")}
                    style={[
                      styles.purposeOption,
                      selectedPurpose === "baby" ? styles.purposeOptionSelected : styles.purposeOptionUnselected
                    ]}
                  >
                    <View style={styles.iconWrapper}>
                      <Baby size={24} color="#ec4899" />
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.optionTitle}>My Baby & Me</Text>
                      <Text style={styles.optionDescription}>For pregnancy, baby care, motherhood journey</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedPurpose("community")}
                    style={[
                      styles.purposeOption,
                      selectedPurpose === "community" ? styles.purposeOptionSelected : styles.purposeOptionUnselected
                    ]}
                  >
                    <View style={styles.iconWrapper}>
                      <Users size={24} color="#ec4899" />
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.optionTitle}>My Wellness</Text>
                      <Text style={styles.optionDescription}>For general health,trackers and community</Text>
                    </View>
                  </Pressable>

                  <View style={styles.footerRow}>
                    {/* <Text style={styles.stepCounter}>Step 2 of 3</Text> */}
                    <View style={styles.footerButtons}>
                      <Button variant="outline" onPress={() => setStep(0)}>
                        Back
                      </Button>
                      <Button
                        onPress={handleNextFromPurpose}
                        disabled={!selectedPurpose}
                        style={styles.nextButton}
                      >
                        Continue
                        <ArrowRight size={16} color="white" style={styles.buttonIcon} />
                      </Button>
                    </View>
                  </View>
                </View>
              )}

              {step === 2 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepLabel}>Tell us about your baby to help us personalize your feed.</Text>

                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Baby's Name (Optional)"
                      value={babyName}
                      onChangeText={setBabyName}
                    />
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Baby Stage</Text>
                    <View style={styles.stageGrid}>
                      {["newborn", "infant", "toddler", "pregnant"].map((stage) => (
                        <Pressable
                          key={stage}
                          onPress={() => setBabyStage(stage)}
                          style={[
                            styles.stageChip,
                            babyStage === stage ? styles.stageChipSelected : styles.stageChipUnselected
                          ]}
                        >
                          <Text style={[
                            styles.stageText,
                            babyStage === stage ? styles.stageTextSelected : styles.stageTextUnselected
                          ]}>
                            {stage === "newborn" ? "0-3m" : stage === "infant" ? "3-12m" : stage === "toddler" ? "1-3y" : "Pregnant"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={styles.inputLabel}>Is this your first baby?</Text>
                    <View style={styles.buttonRow}>
                      <Button
                        style={styles.flex1}
                        variant={firstTimeMom === "yes" ? "default" : "outline"}
                        onPress={() => setFirstTimeMom("yes")}
                      >
                        Yes
                      </Button>
                      <Button
                        style={styles.flex1}
                        variant={firstTimeMom === "no" ? "default" : "outline"}
                        onPress={() => setFirstTimeMom("no")}
                      >
                        No
                      </Button>
                    </View>
                  </View>

                  <View style={styles.footerRow}>
                    {/* <Text style={styles.stepCounter}>Step 3 of 3</Text> */}
                    <View style={styles.footerButtons}>
                      <Button variant="outline" onPress={() => setStep(1)}>
                        Back
                      </Button>
                      <Button onPress={handleFinish} style={styles.nextButton}>
                        Finish
                      </Button>
                    </View>
                  </View>
                </View>
              )}
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'transparent', // background
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b', // muted-foreground
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
  },
  cardHeader: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
    padding: 20,
    borderRadius: 9999,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
  },
  cardContent: {
    gap: 24,
  },
  stepContainer: {
    gap: 16,
  },
  stepLabel: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
  },
  purposeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  purposeOptionSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)', // primary/5
    borderColor: '#ec4899',
  },
  purposeOptionUnselected: {
    backgroundColor: '#ffffff', // card
    borderColor: '#e2e8f0', // border
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
    padding: 8,
    borderRadius: 8,
  },
  optionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0f172a',
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  stepCounter: {
    fontSize: 12,
    color: '#64748b',
  },
  nextButton: {
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 4,
    color: '#0f172a',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0', // border
    backgroundColor: '#ffffff', // background
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#0f172a',
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stageChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  stageChipSelected: {
    backgroundColor: '#ec4899', // primary
    borderColor: '#ec4899',
  },
  stageChipUnselected: {
    backgroundColor: '#ffffff', // card
    borderColor: '#e2e8f0', // border
  },
  stageText: {
    fontSize: 12,
  },
  stageTextSelected: {
    color: '#ffffff',
  },
  stageTextUnselected: {
    color: '#0f172a', // foreground
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});


