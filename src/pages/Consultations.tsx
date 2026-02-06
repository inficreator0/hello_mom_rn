import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Linking, Alert, StyleSheet } from "react-native";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Phone, Calendar, Stethoscope, Sparkles } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  consultations: number;
  phone: string;
  avatar: string;
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Aditi Sharma",
    specialization: "Gynecologist",
    experience: 12,
    consultations: 1480,
    phone: "+91-9820012345",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=aditi",
  },
  {
    id: 2,
    name: "Dr. Rhea Kapoor",
    specialization: "Pediatrician",
    experience: 9,
    consultations: 1120,
    phone: "+91-9830019999",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=rhea",
  },
  {
    id: 3,
    name: "Dr. Meera Nair",
    specialization: "Lactation Consultant",
    experience: 7,
    consultations: 860,
    phone: "+91-9811122233",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=meera",
  },
  {
    id: 4,
    name: "Dr. Kavya Singh",
    specialization: "Mental Health Therapist",
    experience: 11,
    consultations: 1320,
    phone: "+91-9770098877",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=kavya",
  },
];

export const Consultations = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    setDoctors(mockDoctors);
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleAppointment = (doctor: Doctor) => {
    Alert.alert("Appointment", `Booking appointment with ${doctor.name}...`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Consult Experts</Text>
            <Text style={styles.subtitle}>Talk to trusted doctors instantly.</Text>
          </View>
          <View style={styles.sparkleIconWrapper}>
            <Sparkles size={18} color="#ec4899" />
          </View>
        </View>

        <View style={styles.doctorList}>
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent style={styles.cardContent}>
                <View style={styles.doctorHeader}>
                  <View style={styles.avatarContainer}>
                    <SvgUri
                      width="100%"
                      height="100%"
                      uri={doctor.avatar}
                    />
                  </View>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Stethoscope size={14} color="#64748b" style={styles.statIcon} />
                    <Text style={styles.statText}>{doctor.experience} yrs exp.</Text>
                  </View>
                  <Text style={styles.statText}>{doctor.consultations} consults</Text>
                </View>

                <View style={styles.actionsRow}>
                  <Button style={styles.actionButton} onPress={() => handleCall(doctor.phone)}>
                    <Phone size={16} color="white" style={styles.buttonIcon} />
                    <Text>Call</Text>
                  </Button>
                  <Button variant="secondary" style={styles.actionButton} onPress={() => handleAppointment(doctor)}>
                    <Calendar size={16} color="#ec4899" style={styles.buttonIcon} />
                    <Text>Book</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a', // foreground
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b', // muted-foreground
    fontSize: 14,
  },
  sparkleIconWrapper: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)', // primary/10
    padding: 8,
    borderRadius: 9999,
  },
  doctorList: {
    gap: 24,
    paddingBottom: 40,
  },
  cardContent: {
    paddingTop: 24,
  },
  doctorHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9', // muted
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#0f172a',
  },
  doctorSpec: {
    fontSize: 14,
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

