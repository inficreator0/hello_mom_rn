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
import { useDebounce } from "../hooks/useDebounce";
import { ArticleCardSkeleton } from "../components/ui/skeleton";

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cursor, setCursor] = useState<string | null>(null);
  const [page, setPage] = useState(0); // Using page for standard category pagination
  const [hasMore, setHasMore] = useState(true);

  const { showToast } = useToast();
  const navigation = useNavigation<any>();

  const fetchArticles = useCallback(async (
    category: string,
    query: string,
    isLoadMore: boolean = false
  ) => {
    if (!isLoadMore) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let mappedArticles: any[] = [];

      if (query.trim()) {
        const nextCursor = (isLoadMore && cursor) ? cursor : undefined;
        const response = await articlesAPI.search(query, nextCursor, 10);

        mappedArticles = response.data.map((item: any) => ({
          ...item,
          preview: item.summary,
          image: item.featuredImageUrl,
          readTime: "5 min read",
        }));

        setCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);
      } else {
        const pageNum = isLoadMore ? page + 1 : 0;
        let response;
        if (category === "All") {
          response = await articlesAPI.getPublished(pageNum, 10);
        } else {
          response = await articlesAPI.getPublishedByCategory(category, pageNum, 10);
        }

        mappedArticles = response.content.map(item => ({
          ...item,
          preview: item.summary,
          image: item.featuredImageUrl,
          readTime: "5 min read",
        }));

        setPage(pageNum);
        setHasMore(!response.last && response.content.length > 0);
      }

      setArticles(prev => isLoadMore ? [...prev, ...mappedArticles] : mappedArticles);

    } catch (error) {
      console.error("Failed to fetch articles:", error);
      showToast("Failed to load articles", "error");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [showToast, cursor, page]);

  useEffect(() => {
    // Reset state before initial fetch
    setCursor(null);
    setPage(0);
    fetchArticles(selectedCategory, debouncedSearchQuery, false);
  }, [selectedCategory, debouncedSearchQuery, fetchArticles]);

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchArticles(selectedCategory, debouncedSearchQuery, true);
    }
  };

  // filteredArticles mapping removed because search logic is handled by backend API and the local articles list is accurate

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
      <ScreenHeader title="Helpful Articles" showBackButton={false} showMenuButton={true} />

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

      {isLoading && articles.length === 0 ? (
        <View style={[styles.listContent, { paddingHorizontal: 16 }]}>
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? `No articles found for "${searchQuery}"` : "No articles found."}
            </Text>
          }
          onRefresh={() => {
            setCursor(null);
            setPage(0);
            fetchArticles(selectedCategory, debouncedSearchQuery, false);
          }}
          refreshing={isLoading}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ArticleCardSkeleton />
              </View>
            ) : null
          }
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
