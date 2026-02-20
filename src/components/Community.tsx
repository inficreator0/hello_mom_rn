import { useState, useEffect, useMemo } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Plus } from "lucide-react-native";
import { Post, PostFormData, CommunityCategory } from "../types";
import SearchBar from "./common/SearchBar";
import PostCard from "./common/PostCard";

import CategoryTabs from "./common/CategoryTabs";
import { usePostsStore, transformPost } from "../store/postsStore";
import { postsAPI } from "../lib/api/posts";
import { useToast } from "../context/ToastContext";
import { PostCardSkeleton } from "./ui/skeleton";
import { CommunityEmptyState } from "./common/CommunityEmptyState";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilterBottomSheet } from "./common/FilterBottomSheet";
import { PageContainer } from "./common/PageContainer";
import { ScreenHeader } from "./common/ScreenHeader";

const CATEGORIES: CommunityCategory[] = ["All", "Pregnancy", "Postpartum", "Feeding", "Sleep", "Mental Health", "Recovery", "Milestones"];

const Community = () => {
  const { posts, refreshPosts, isLoading, addPost, hasMore, loadMorePosts, currentCategory, currentSort, updatePost, removePost } = usePostsStore();
  const { showToast } = useToast();
  const navigation = useNavigation<any>();

  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>((currentCategory as CommunityCategory) || "All");
  const [selectedSort, setSelectedSort] = useState<"recent" | "upvotes">("recent");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // Sync with store and initial fetch on mount
  useEffect(() => {
    if (currentCategory) setSelectedCategory(currentCategory as CommunityCategory);
    if (currentSort) setSelectedSort(currentSort);
    // Only fetch on initial mount
    void refreshPosts(currentCategory || selectedCategory, currentSort || selectedSort);
  }, []);

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    void refreshPosts(selectedCategory, selectedSort);
  };

  const handleVote = async (postId: string | number, voteType: "up" | "down") => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const currentVote = post.userVote;
    let newVote: "up" | "down" | null = voteType;
    let voteChange = 0;

    // Determine new vote state and count change
    if (currentVote === voteType) {
      // Toggle off
      newVote = null;
      voteChange = voteType === "up" ? -1 : 1;
    } else {
      // New vote or switching vote
      if (currentVote === "up") voteChange -= 1;
      if (currentVote === "down") voteChange += 1;

      if (voteType === "up") voteChange += 1;
      if (voteType === "down") voteChange -= 1;
    }

    // Optimistic Update
    updatePost(postId, (p) => ({
      ...p,
      userVote: newVote,
      votes: p.votes + voteChange,
    }));

    try {
      if (voteType === "up") {
        await postsAPI.upvote(String(postId));
      } else {
        await postsAPI.downvote(String(postId));
      }
    } catch (error) {
      console.error("Vote failed", error);
      showToast("Failed to vote", "error");
      // Revert Optimistic Update
      updatePost(postId, (p) => ({
        ...p,
        userVote: currentVote,
        votes: p.votes - voteChange, // Undo change
      }));
    }
  };

  const handleEdit = (post: Post) => {
    navigation.navigate("CreatePost", { post });
  };

  const handleDelete = async (postId: string | number) => {
    try {
      await postsAPI.delete(String(postId));
      showToast("Post deleted", "success");
      // Remove from store locally
      removePost(postId);
    } catch (error) {
      console.error("Delete failed", error);
      showToast("Failed to delete post", "error");
    }
  };

  const handleReport = async (postId: string | number, data: { category: string; description?: string }) => {
    try {
      await postsAPI.report(String(postId), data);
      showToast("Post reported", "success");
    } catch (error) {
      console.error("Report failed", error);
      showToast("Failed to report post", "error");
    }
  };

  const handleBookmark = async (postId: string | number) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const isBookmarked = post.bookmarked;
    const newBookmarkedState = !isBookmarked;

    // Optimistic Update
    updatePost(postId, (p) => ({
      ...p,
      bookmarked: newBookmarkedState,
    }));

    try {
      if (newBookmarkedState) {
        await postsAPI.save(String(postId));
        showToast("Post saved", "success");
      } else {
        await postsAPI.unsave(String(postId));
        showToast("Post removed from saved", "success");
      }
    } catch (error) {
      console.error("Bookmark failed", error);
      showToast("Failed to update bookmark", "error");
      // Revert Optimistic Update
      updatePost(postId, (p) => ({
        ...p,
        bookmarked: isBookmarked,
      }));
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        {isLoading ? <ActivityIndicator color="#ec4899" /> : null}
      </View>
    );
  };

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader title="Community" showBackButton={false} showMenuButton={true} />

      <View style={styles.content}>
        <View style={styles.header}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search posts..."
            style={styles.searchBar}
            onFilterClick={() => setIsFilterOpen(true)}
          />
        </View>

        {isLoading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </View>
        ) : filteredPosts.length === 0 ? (
          <CommunityEmptyState onReset={() => { setSearchQuery(""); setSelectedCategory("All"); void refreshPosts("All", "recent"); }} />
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onVote={handleVote}
                onBookmark={handleBookmark}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReport={handleReport}
              />
            )}
            onEndReached={() => {
              if (hasMore && !isLoading) {
                void loadMorePosts();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshing={isLoading && posts.length > 0}
            onRefresh={() => refreshPosts(selectedCategory, selectedSort, true)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}

        <Pressable
          onPress={() => navigation.navigate("CreatePost")}
          style={({ pressed }) => [
            {
              position: 'absolute',
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#ec4899',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <Plus size={28} color="white" />
        </Pressable>

        <FilterBottomSheet
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => setSelectedCategory(cat as CommunityCategory)}
          selectedSort={selectedSort as "recent" | "upvotes"}
          onSortChange={(sort) => setSelectedSort(sort as "recent" | "upvotes")}
          onApply={handleApplyFilters}
        />
      </View>
    </PageContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 12,
  },
  searchBar: {
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 20,
    gap: 16,
  },
  flatListContent: {
    paddingBottom: 40,
  },
});

export default Community;
