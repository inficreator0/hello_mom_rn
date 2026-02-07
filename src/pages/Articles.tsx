import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Image, FlatList, StyleSheet, ActivityIndicator, Share } from "react-native";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import SearchBar from "../components/common/SearchBar";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { articlesAPI } from "../lib/api/articles";
import { Article } from "../types";
import { useToast } from "../context/ToastContext";
import { useNavigation } from "@react-navigation/native";
import { Share2 } from "lucide-react-native";
import * as Linking from 'expo-linking';

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

export const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { showToast } = useToast();
  const navigation = useNavigation<any>();

  const fetchArticles = useCallback(async (category: string) => {
    setIsLoading(true);
    try {
      let response;
      if (category === "All") {
        response = await articlesAPI.getPublished(0, 50);
      } else {
        response = await articlesAPI.getPublishedByCategory(category, 0, 50);
      }

      const mappedArticles = response.content.map(item => ({
        ...item,
        // Ensure properties exist for UI mapping
        preview: item.summary,
        image: item.featuredImageUrl,
        readTime: "5 min read", // Mocking read time as backend doesn't provide it yet
      }));

      setArticles(mappedArticles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      showToast("Failed to load articles", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchArticles(selectedCategory);
  }, [selectedCategory, fetchArticles]);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleShare = async (article: Article) => {
    try {
      const articleLink = Linking.createURL(`article/${article.id}`);
      await Share.share({
        message: `${article.title}\n\nRead this article on Nova: ${articleLink}`,
        url: articleLink,
      });
    } catch (error) {
      console.error("Error sharing article:", error);
    }
  };

  const renderArticle = ({ item }: { item: Article & { preview?: string, image?: string, readTime?: string } }) => (
    <Card style={styles.card}>
      <Pressable onPress={() => navigation.navigate("ArticleDetail", { id: item.id })}>
        <Image
          source={{ uri: item.image || item.featuredImageUrl }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      </Pressable>
      <CardContent style={styles.cardContent}>
        <Pressable onPress={() => navigation.navigate("ArticleDetail", { id: item.id })}>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleMeta}>
            {item.category} • {item.readTime}
          </Text>
          <Text style={styles.articlePreview} numberOfLines={2}>
            {item.summary}
          </Text>
        </Pressable>
        <View style={styles.cardActions}>
          <Button
            variant="secondary"
            style={styles.readMoreButton}
            onPress={() => navigation.navigate("ArticleDetail", { id: item.id })}
          >
            <Text style={styles.readMoreText}>Read More</Text>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            style={styles.shareButton}
            onPress={() => handleShare(item)}
          >
            <Share2 size={18} color="#ec4899" />
          </Button>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader title="Helpful Articles" showBackButton={false} />

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No articles found.</Text>
          }
          onRefresh={() => fetchArticles(selectedCategory)}
          refreshing={isLoading}
        />
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  readMoreButton: {
    flex: 1,
    height: 40,
  },
  readMoreText: {
    color: '#ec4899', // primary
    fontWeight: 'bold',
  },
  shareButton: {
    height: 40,
    width: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
