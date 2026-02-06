import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, FlatList, StyleSheet } from "react-native";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import SearchBar from "../components/common/SearchBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";

interface Article {
  id: number;
  title: string;
  category: string;
  preview: string;
  image: string;
  readTime: string;
  alt?: string;
}

const CATEGORIES = [
  "All",
  "Pregnancy",
  "Postpartum",
  "Nutrition",
  "Mental Health",
  "Baby Care",
  "Breastfeeding",
  "Fitness & Recovery",
];

const mockArticles: Article[] = [
  {
    id: 1,
    title: "Body in the First Trimester",
    category: "Pregnancy",
    preview: "Learn about early pregnancy symptoms, changes, and precautions.",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1609171676687-85dfc9d37fac?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Postpartum Recovery Guide",
    category: "Postpartum",
    preview: "A realistic guide to healing physically and emotionally after birth.",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1607968565043-36c0f7e0f92b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Boost Milk Supply Naturally",
    category: "Breastfeeding",
    preview: "Healthy, natural foods that can support milk production.",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Managing Stress & Anxiety",
    category: "Mental Health",
    preview: "Techniques for staying balanced during motherhood.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    title: "Prenatal Nutrition Guide",
    category: "Nutrition",
    preview: "A doctor-approved guide to balanced pregnancy diet.",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1543352634-093a2f8688d6?auto=format&fit=crop&w=1200&q=80",
  }
];

export const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setArticles(mockArticles);
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;

    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.preview.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const renderArticle = ({ item }: { item: Article }) => (
    <Card style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={styles.articleImage}
        resizeMode="cover"
      />
      <CardContent style={styles.cardContent}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleMeta}>
          {item.category} • {item.readTime}
        </Text>
        <Text style={styles.articlePreview} numberOfLines={2}>
          {item.preview}
        </Text>
        <Button variant="secondary" style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Read More</Text>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader title="Helpful Articles" showBackButton={false} />
      <View style={styles.header}>
        <Text style={styles.subtitle}>Expert guides for your journey.</Text>
      </View>

      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderArticle}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.searchContainer}>
              <SearchBar
                placeholder="Search articles..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryChip,
                      isSelected ? styles.categoryChipSelected : styles.categoryChipUnselected
                    ]}
                  >
                    <Text style={[
                      styles.categoryText,
                      isSelected ? styles.categoryTextSelected : styles.categoryTextUnselected
                    ]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No articles found.</Text>
        }
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a', // foreground
  },
  subtitle: {
    color: '#64748b', // muted-foreground
    fontSize: 12,
  },
  listHeader: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#ec4899', // primary
    borderColor: '#ec4899',
  },
  categoryChipUnselected: {
    backgroundColor: '#ffffff', // card
    borderColor: '#e2e8f0', // border
  },
  categoryText: {
    fontSize: 12,
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  categoryTextUnselected: {
    color: '#64748b', // muted-foreground
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    paddingTop: 16,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0f172a',
  },
  articleMeta: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  articlePreview: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  readMoreButton: {
    height: 40,
  },
  readMoreText: {
    color: '#ec4899', // primary
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 40,
  },
});

