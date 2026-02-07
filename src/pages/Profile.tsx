import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Edit, Calendar, Baby, Sparkles } from "lucide-react-native";
import PostCard from "../components/common/PostCard";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../lib/api/posts";
import { StatCardSkeleton, PostCardSkeleton } from "../components/ui/skeleton";
import { usePreferences } from "../context/PreferencesContext";
import { Post } from "../types";
import { Badge } from "../components/ui/badge";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { SvgUri } from "react-native-svg";

import { useToast } from "../context/ToastContext";

const Profile = () => {
  const { logout, user: authUser } = useAuth();
  const navigation = useNavigation<any>();
  const { mode, setMode, babyName, babyStage, firstTimeMom, focusAreas } =
    usePreferences();

  const [bio, setBio] = useState(
    "Mother of two, passionate about pregnancy health, mindful parenting, and wellness."
  );
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    postsCount: 0,
    commentsCount: 0,
    totalUpvotesReceived: 0,
    savedCount: 0,
  });

  const { showToast } = useToast();

  const user = {
    name: authUser?.username || "User",
    avatar: "https://api.dicebear.com/8.x/fun-emoji/svg?seed=mother",
    joinedAt: "2024-01-10",
  };

  const updateLocalPost = (postId: string | number, updates: Partial<Post>) => {
    setMyPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
    );
  };

  const handleVote = async (postId: string | number, voteType: "up" | "down") => {
    const post = myPosts.find((p) => p.id === postId);
    if (!post) return;

    const currentVote = post.userVote;
    let newVote: "up" | "down" | null = voteType;
    let voteChange = 0;

    if (currentVote === voteType) {
      newVote = null;
      voteChange = voteType === "up" ? -1 : 1;
    } else {
      if (currentVote === "up") voteChange -= 1;
      if (currentVote === "down") voteChange += 1;

      if (voteType === "up") voteChange += 1;
      if (voteType === "down") voteChange -= 1;
    }

    // Optimistic Update
    updateLocalPost(postId, {
      userVote: newVote,
      votes: (post.votes || 0) + voteChange,
    });

    try {
      if (voteType === "up") {
        await postsAPI.upvote(String(postId));
      } else {
        await postsAPI.downvote(String(postId));
      }
    } catch (error) {
      console.error("Vote failed", error);
      showToast("Failed to vote", "error");
      updateLocalPost(postId, {
        userVote: currentVote,
        votes: post.votes,
      });
    }
  };

  const handleEdit = (post: Post) => {
    navigation.navigate("CreatePost", { post });
  };

  const handleDelete = async (postId: string | number) => {
    try {
      await postsAPI.delete(String(postId));
      showToast("Post deleted", "success");

      // Update local state
      setMyPosts(prev => prev.filter(p => p.id !== postId));
      setBookmarks(prev => prev.filter(p => p.id !== postId));

      // Also update stats if needed
      setStats(prev => ({
        ...prev,
        postsCount: Math.max(0, prev.postsCount - 1)
      }));
    } catch (error) {
      console.error("Delete failed", error);
      showToast("Failed to delete post", "error");
    }
  };

  const handleReport = async (postId: string | number, reason: string) => {
    try {
      await postsAPI.report(String(postId), reason);
      showToast("Post reported", "success");
    } catch (error) {
      console.error("Report failed", error);
      showToast("Failed to report post", "error");
    }
  };

  const handleBookmark = async (postId: string | number) => {
    const post = myPosts.find((p) => p.id === postId);
    if (!post) return;

    const isBookmarked = post.bookmarked;
    const newBookmarkedState = !isBookmarked;

    updateLocalPost(postId, { bookmarked: newBookmarkedState });

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
      updateLocalPost(postId, { bookmarked: isBookmarked });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
            // Navigation handled by App.tsx
          }
        }
      ]
    );
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const myPostsResponse = await postsAPI.getMyPosts(0, 20);
        const mappedPosts = myPostsResponse.content.map((p: any) => {
          if (p.currentUserVote) console.log(`[Profile] Post ${p.id} vote:`, p.currentUserVote);
          return {
            id: p.id,
            title: p.title,
            content: p.content,
            author: p.authorUsername,
            authorId: p.authorId,
            authorUsername: p.authorUsername,
            category: p.category || "General",
            flair: p.flair,
            votes: (p.upvotes || 0) - (p.downvotes || 0),
            userVote: (p.currentUserVote === "UPVOTE" ? "up" : p.currentUserVote === "DOWNVOTE" ? "down" : null) as "up" | "down" | null,
            bookmarked: p.saved || false,
            createdAt: new Date(p.createdAt),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
            comments: [],
            commentCount: p.commentCount || 0,
          }
        });
        setMyPosts(mappedPosts);

        const savedPostsResponse = await postsAPI.getSavedPosts(0, 20);
        const mappedSavedPosts = savedPostsResponse.content.map((p: any) => ({
          id: p.id,
          title: p.title,
          content: p.content,
          author: p.authorUsername,
          authorId: p.authorId,
          authorUsername: p.authorUsername,
          category: p.category || "General",
          flair: p.flair,
          votes: (p.upvotes || 0) - (p.downvotes || 0),
          userVote: (p.currentUserVote === "UPVOTE" ? "up" : p.currentUserVote === "DOWNVOTE" ? "down" : null) as "up" | "down" | null,
          bookmarked: true,
          createdAt: new Date(p.createdAt),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
          comments: [],
          commentCount: p.commentCount || 0,
        }));
        setBookmarks(mappedSavedPosts);

        if (authUser?.username) {
          const statsResponse = await postsAPI.getUserStats(authUser.username);
          setStats({
            postsCount: statsResponse.postsCount,
            commentsCount: statsResponse.commentsCount,
            totalUpvotesReceived: statsResponse.totalUpvotesReceived,
            savedCount: savedPostsResponse.totalElements,
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser?.username]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <PageContainer style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Profile"
        showBackButton={false}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <SvgUri
                width="100%"
                height="100%"
                uri={user.avatar}
              />
            </View>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.joinedDateContainer}>
                <Calendar size={14} color="#64748b" style={styles.calendarIcon} />
                <Text style={styles.joinedDate}>Joined {formatDate(user.joinedAt)}</Text>
              </View>
            </View>
          </View>
          <Button variant="outline" size="sm" onPress={handleLogout} style={styles.logoutBtn}>
            Logout
          </Button>
        </View>

        {/* Bio */}
        <Card style={styles.bioCard}>
          <CardContent style={styles.bioCardContent}>
            <View style={styles.bioHeader}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <Pressable onPress={() => setIsEditingBio(!isEditingBio)} style={styles.editButton}>
                <Edit size={18} color="#ec4899" />
              </Pressable>
            </View>

            {isEditingBio ? (
              <View>
                <TextInput
                  style={styles.bioInput}
                  multiline
                  value={bio}
                  onChangeText={setBio}
                />
                <Button style={styles.saveBioButton} size="sm" onPress={() => setIsEditingBio(false)}>
                  Save
                </Button>
              </View>
            ) : (
              <Text style={styles.bioText}>
                {bio}
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Mode Settings */}
        <Card style={styles.settingsCard}>
          <CardContent style={styles.settingsCardContent}>
            <View style={styles.settingsHeader}>
              <View style={styles.settingsHeaderLeft}>
                <Baby size={20} color="#ec4899" style={styles.babyIcon} />
                <Text style={styles.sectionTitle}>Baby Features</Text>
              </View>
              <Badge variant={mode === "baby" ? "default" : "secondary"}>
                {mode === "baby" ? "Enabled" : "Disabled"}
              </Badge>
            </View>
            <Text style={styles.settingsDescription}>
              Focus on baby-themed trackers and tools across the app.
            </Text>
            <View style={styles.modeButtons}>
              <Button
                style={styles.flex1}
                variant={mode === "baby" ? "default" : "outline"}
                onPress={() => setMode("baby")}
              >
                Baby Mode
              </Button>
              <Button
                style={styles.flex1}
                variant={mode === "community" ? "default" : "outline"}
                onPress={() => setMode("community")}
              >
                Community
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Baby Info */}
        {mode === "baby" && (babyName || babyStage) && (
          <Card style={styles.babyProfileCard}>
            <CardContent style={styles.babyProfileContent}>
              <View style={styles.babyHeader}>
                <Sparkles size={20} color="#ec4899" style={styles.sparklesIcon} />
                <Text style={styles.sectionTitle}>Baby Profile</Text>
              </View>
              <View style={styles.badgeContainer}>
                {babyName && (
                  <View style={styles.babyBadge}>
                    <Text style={styles.badgeText}><Text style={styles.boldText}>Name:</Text> {babyName}</Text>
                  </View>
                )}
                {babyStage && (
                  <View style={styles.babyBadge}>
                    <Text style={styles.badgeText}><Text style={styles.boldText}>Stage:</Text> {babyStage}</Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Posts" value={stats.postsCount} />
          <StatCard label="Comments" value={stats.commentsCount} />
          <StatCard label="Saved" value={stats.savedCount} />
          <StatCard label="Upvotes" value={stats.totalUpvotesReceived} />
        </View>

        {/* My Posts */}
        <Text style={styles.sectionTitleLarge}>My Recent Posts</Text>
        {isLoading ? (
          <View style={[styles.postsList, styles.skeletonGap]}>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </View>
        ) : myPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>You haven't posted anything yet.</Text>
          </View>
        ) : (
          <View style={styles.postsList}>
            {myPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={handleVote}
                onBookmark={handleBookmark}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReport={handleReport}
                showActions={false}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card style={styles.statCard}>
    <CardContent style={styles.statCardContent}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </CardContent>
  </Card>
);

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
    marginBottom: 20,
  },
  logoutBtn: {
    borderColor: '#ec4899',
    height: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9', // muted
    overflow: 'hidden',
  },
  userNameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a', // foreground
  },
  joinedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  calendarIcon: {
    marginRight: 4,
  },
  joinedDate: {
    fontSize: 12,
    color: '#64748b', // muted-foreground
  },
  bioCard: {
    marginBottom: 24,
  },
  bioCardContent: {
    paddingTop: 24,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0f172a',
  },
  editButton: {
    padding: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // input
    backgroundColor: '#ffffff', // background
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 100,
  },
  saveBioButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  bioText: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
    lineHeight: 20,
  },
  settingsCard: {
    marginBottom: 24,
  },
  settingsCardContent: {
    paddingTop: 24,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyIcon: {
    marginRight: 8,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  babyProfileCard: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.05)', // primary/5
    borderColor: 'rgba(255, 107, 107, 0.2)', // primary/20
  },
  babyProfileContent: {
    paddingTop: 24,
  },
  babyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sparklesIcon: {
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  babyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: '#0f172a',
  },
  boldText: {
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statCardContent: {
    paddingTop: 24,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  loadingIndicator: {
    paddingVertical: 40,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff', // card
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0', // border
  },
  emptyStateText: {
    color: '#64748b',
    textAlign: 'center',
  },
  postsList: {
    paddingBottom: 40,
  },
  skeletonGap: {
    gap: 12,
  }
});

export { Profile };
