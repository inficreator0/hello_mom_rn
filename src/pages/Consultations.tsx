import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { SvgUri } from "react-native-svg";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import {
  Phone,
  Calendar,
  Star,
  Search,
  Brain,
  Baby,
  Heart,
  Milk,
  Stethoscope,
  ChevronRight,
  CheckCircle,
} from "lucide-react-native";
import { doctorsAPI } from "../lib/api/doctors";
import { DoctorResponse, DoctorSummaryResponse } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  category: string;
  experience: number;
  consultations: number;
  rating: number;
  phone: string;
  avatar: string;
  available: boolean;
  nextSlot: string;
  languages: string[];
  fee: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Aditi Sharma",
    specialization: "Gynecologist",
    category: "Gynecologist",
    experience: 12,
    consultations: 1480,
    rating: 4.9,
    phone: "+91-9820012345",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=aditi",
    available: true,
    nextSlot: "Available Now",
    languages: ["English", "Hindi"],
    fee: "₹499",
  },
  {
    id: 2,
    name: "Dr. Rhea Kapoor",
    specialization: "Pediatrician",
    category: "Pediatrician",
    experience: 9,
    consultations: 1120,
    rating: 4.8,
    phone: "+91-9830019999",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=rhea",
    available: false,
    nextSlot: "Next: 4:00 PM",
    languages: ["English", "Marathi"],
    fee: "₹399",
  },
  {
    id: 3,
    name: "Dr. Meera Nair",
    specialization: "Lactation Consultant",
    category: "Lactation",
    experience: 7,
    consultations: 860,
    rating: 4.9,
    phone: "+91-9811122233",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=meera",
    available: true,
    nextSlot: "Available Now",
    languages: ["English", "Malayalam"],
    fee: "₹349",
  },
  {
    id: 4,
    name: "Dr. Kavya Singh",
    specialization: "Mental Health Therapist",
    category: "Mental Health",
    experience: 11,
    consultations: 1320,
    rating: 4.7,
    phone: "+91-9770098877",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=kavya",
    available: false,
    nextSlot: "Next: Tomorrow",
    languages: ["English", "Hindi"],
    fee: "₹599",
  },
  {
    id: 5,
    name: "Dr. Sunita Rao",
    specialization: "OB-GYN",
    category: "Gynecologist",
    experience: 15,
    consultations: 2100,
    rating: 4.95,
    phone: "+91-9900011122",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=sunita",
    available: true,
    nextSlot: "Available Now",
    languages: ["English", "Telugu", "Kannada"],
    fee: "₹699",
  },
  {
    id: 6,
    name: "Dr. Priya Menon",
    specialization: "Child Psychologist",
    category: "Mental Health",
    experience: 8,
    consultations: 740,
    rating: 4.6,
    phone: "+91-9955544433",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=priya",
    available: false,
    nextSlot: "Next: 6:00 PM",
    languages: ["English", "Tamil"],
    fee: "₹449",
  },
];

// ─── Filters ──────────────────────────────────────────────────────────────────

type FilterKey = "All" | "Gynecologist" | "Pediatrician" | "Lactation" | "Mental Health";

const FILTERS: { key: FilterKey; icon: any; color: string }[] = [
  { key: "All", icon: Stethoscope, color: "#ec4899" },
  { key: "Gynecologist", icon: Heart, color: "#ec4899" },
  { key: "Pediatrician", icon: Baby, color: "#3b82f6" },
  { key: "Lactation", icon: Milk, color: "#f59e0b" },
  { key: "Mental Health", icon: Brain, color: "#8b5cf6" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Gynecologist: { bg: "#fce7f3", text: "#be185d" },
  Pediatrician: { bg: "#dbeafe", text: "#1d4ed8" },
  Lactation: { bg: "#fef3c7", text: "#b45309" },
  "Mental Health": { bg: "#ede9fe", text: "#6d28d9" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const Consultations = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [summary, setSummary] = useState<DoctorSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [doctorsData, summaryData] = await Promise.all([
        doctorsAPI.getAllDoctors(),
        doctorsAPI.getSummary(),
      ]);

      const mappedDoctors: Doctor[] = doctorsData.map((d: DoctorResponse) => {
        let category: string = "Gynecologist";
        const spec = d.specialization.toLowerCase();
        if (spec.includes("ped")) category = "Pediatrician";
        else if (spec.includes("lact")) category = "Lactation";
        else if (spec.includes("mental") || spec.includes("psych") || spec.includes("therapist")) category = "Mental Health";
        else if (spec.includes("gyn") || spec.includes("obs")) category = "Gynecologist";

        return {
          id: d.id,
          name: d.name,
          specialization: d.specialization,
          category: category,
          experience: d.experienceYears,
          consultations: d.numberOfConsultations,
          rating: d.rating,
          phone: d.phoneNumber,
          avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${d.name.replace(/\s/g, '')}`,
          available: true,
          nextSlot: "Available Now",
          languages: d.languages.split(",").map((s) => s.trim()),
          fee: `₹${d.fees}`,
        };
      });

      setDoctors(mappedDoctors);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to fetch consultations data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = mockDoctors;
    if (activeFilter !== "All") {
      list = list.filter((d) => d.category === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeFilter, searchQuery]);

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);

  const handleBook = (doctor: Doctor) => {
    Alert.alert(
      "Book Consultation",
      `Booking with ${doctor.name} (${doctor.fee}/session). In-app booking coming soon!`,
      [{ text: "OK" }]
    );
  };

  return (
    <PageContainer style={styles.container} edges={["top"]}>
      <ScreenHeader
        title="Consult Experts"
        showBackButton={false}
        showMenuButton={true}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Banner */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroBanner}>
          <View>
            <Text style={styles.heroTitle}>Find Your Expert 👩‍⚕️</Text>
            <Text style={styles.heroSubtitle}>
              Talk to trusted doctors & specialists.{"\n"}Get care when you need it most.
            </Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{summary?.totalDoctors}+</Text>
              <Text style={styles.heroStatLabel}>Doctors</Text>
            </View>
            <View style={styles.heroDivider} />
            {/* <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>4.8★</Text>
              <Text style={styles.heroStatLabel}>Avg Rating</Text>
            </View> */}
            <View style={styles.heroDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{summary ? `${(summary.totalSessions / 1000).toFixed(summary.totalSessions >= 1000 ? 1 : 0)}K` : "10K"}+</Text>
              <Text style={styles.heroStatLabel}>Sessions</Text>
            </View>
          </View>
        </Animated.View>

        {isLoading && (
          <View style={{ padding: 20 }}>
            <ActivityIndicator color="#ec4899" />
          </View>
        )}

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.searchContainer}>
          <Search size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or specialization..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        {/* Filter Chips */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {FILTERS.map(({ key, icon: Icon, color }) => {
              const active = activeFilter === key;
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.filterChip,
                    active && { backgroundColor: color, borderColor: color },
                  ]}
                  onPress={() => setActiveFilter(key)}
                >
                  <Icon size={13} color={active ? "#fff" : color} style={{ marginRight: 5 }} />
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Results count */}
        <Text style={styles.resultCount}>{filtered.length} experts found</Text>

        {/* Doctor Cards */}
        <View style={styles.doctorList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Stethoscope size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No experts found</Text>
            </View>
          ) : (
            filtered.map((doctor, index) => {
              const catColor = CATEGORY_COLORS[doctor.category] ?? { bg: "#f1f5f9", text: "#475569" };
              return (
                <Animated.View
                  key={doctor.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  style={styles.card}
                >
                  {/* Card Top Row */}
                  <View style={styles.cardTop}>
                    {/* Avatar */}
                    <View style={styles.avatarWrapper}>
                      <SvgUri
                        width="100%"
                        height="100%"
                        uri={doctor.avatar}
                      />
                      {/* Online dot */}
                      {doctor.available && <View style={styles.onlineDot} />}
                    </View>

                    {/* Info */}
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.name}</Text>
                      <View style={[styles.badge, { backgroundColor: catColor.bg }]}>
                        <Text style={[styles.badgeText, { color: catColor.text }]}>
                          {doctor.specialization}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        <Text style={styles.metaText}>{doctor.rating}  •  </Text>
                        <Text style={styles.metaText}>{doctor.experience} yrs  •  </Text>
                        <Text style={styles.metaText}>{doctor.consultations} consults</Text>
                      </View>
                    </View>
                  </View>

                  {/* Availability + Fee Row */}
                  <View style={styles.availRow}>
                    <View style={[
                      styles.availBadge,
                      { backgroundColor: doctor.available ? "#f0fdf4" : "#f8fafc" }
                    ]}>
                      <CheckCircle
                        size={12}
                        color={doctor.available ? "#10b981" : "#94a3b8"}
                      />
                      <Text style={[
                        styles.availText,
                        { color: doctor.available ? "#10b981" : "#64748b" }
                      ]}>
                        {doctor.nextSlot}
                      </Text>
                    </View>
                    <Text style={styles.feeText}>{doctor.fee} / session</Text>
                  </View>

                  {/* Languages */}
                  <Text style={styles.languageText}>
                    🌐 {doctor.languages.join(" · ")}
                  </Text>

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.bookButton}
                      onPress={() => handleBook(doctor)}
                    >
                      <Calendar size={15} color="#fff" />
                      <Text style={styles.bookButtonText}>Book Consultation</Text>
                    </Pressable>
                    <Pressable
                      style={styles.callButton}
                      onPress={() => handleCall(doctor.phone)}
                    >
                      <Phone size={16} color="#ec4899" />
                    </Pressable>
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </PageContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Hero
  heroBanner: {
    backgroundColor: "#fdf2f8",
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fce7f3",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ec4899",
  },
  heroStatLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 1,
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#f1f5f9",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    padding: 0,
  },

  // Filters
  filterScroll: {
    marginBottom: 10,
  },
  filterContent: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  filterChipTextActive: {
    color: "#fff",
  },

  resultCount: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 12,
    marginLeft: 2,
  },

  // Doctor list
  doctorList: {
    gap: 14,
  },

  // Doctor card
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 14,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fce7f3",
    position: "relative",
  },
  onlineDot: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  doctorInfo: {
    flex: 1,
    gap: 5,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
  },

  // Availability
  availRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  availText: {
    fontSize: 12,
    fontWeight: "600",
  },
  feeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },

  languageText: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 12,
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#ec4899",
    borderRadius: 12,
    paddingVertical: 11,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fce7f3",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    gap: 12,
    padding: 48,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});
