import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ArrowLeft, Trash2, ArrowBigUp, ArrowBigDown, MessageSquare, Bookmark, BookmarkCheck } from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { usePostsStore } from "../store/postsStore";
import { postsAPI, commentsAPI } from "../lib/api/posts";
import CommentDialog from "../components/common/CommentDialog";
import ReplyDialog from "../components/common/ReplyDialog";
import { Comment, CommunityCategory } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/common/EmptyState";
import { SafeAreaView } from "react-native-safe-area-context";

const PostDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id = route.params?.id;

  const { getPostById, updatePost, refreshPosts, removePost, loadComments, toggleBookmark } = usePostsStore();
  const post = id ? getPostById(id) : undefined;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (id && !post) {
      void refreshPosts();
    }
  }, [id, post, refreshPosts]);

  useEffect(() => {
    if (id && post && loadedPostId !== id) {
      const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
          await loadComments(id);
          setLoadedPostId(id);
        } catch (error) {
          console.error("Failed to load comments:", error);
        } finally {
          setIsLoadingComments(false);
        }
      };
      fetchComments();
    }
  }, [id, post, loadedPostId, loadComments]);

  if (!post) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#ec4899" size="large" />
      </SafeAreaView>
    );
  }

  const isAuthor =
    !!user &&
    (user.userId === post.authorId ||
      user.id === post.authorId ||
      (!!user.username && !!post.authorUsername && user.username === post.authorUsername));

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleVote = async (voteType: "up" | "down") => {
    const previousVote = post.userVote;
    const previousVotes = post.votes;

    // Optimistic UI update
    updatePost(post.id, (currentPost) => {
      const currentVote = currentPost.userVote;
      let newVotes = currentPost.votes;

      if (currentVote === voteType) {
        newVotes += voteType === "up" ? -1 : 1;
        return { ...currentPost, votes: newVotes, userVote: null };
      } else if (currentVote === null) {
        newVotes += voteType === "up" ? 1 : -1;
        return { ...currentPost, votes: newVotes, userVote: voteType };
      } else {
        newVotes += voteType === "up" ? 2 : -2;
        return { ...currentPost, votes: newVotes, userVote: voteType };
      }
    });

    try {
      if (voteType === "up") {
        await postsAPI.upvote(String(post.id));
      } else {
        await postsAPI.downvote(String(post.id));
      }
    } catch (error: any) {
      updatePost(post.id, (currentPost) => ({
        ...currentPost,
        votes: previousVotes,
        userVote: previousVote ?? null,
      }));
      showToast("Failed to update vote", "error");
    }
  };

  const handleBookmark = async () => {
    try {
      await toggleBookmark(post.id);
    } catch (error: any) {
      showToast("Failed to update bookmark", "error");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !id) return;
    try {
      await commentsAPI.create(id, { content: commentText });
      await loadComments(id);
      setCommentText("");
      setIsCommentDialogOpen(false);
      showToast("Comment added", "success");
    } catch (error: any) {
      showToast("Failed to add comment", "error");
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await postsAPI.delete(id);
              removePost(post.id);
              navigation.goBack();
              showToast("Post deleted", "success");
            } catch (error) {
              showToast("Failed to delete post", "error");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Post Details</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.postCard}>
          <CardHeader>
            <View style={styles.postHeaderRow}>
              <View style={styles.postHeaderText}>
                <CardTitle style={styles.postTitle}>{post.title}</CardTitle>
                <Text style={styles.postMeta}>
                  by {post.author} • {formatDate(post.createdAt)}
                </Text>
                <View style={styles.badgeRow}>
                  {post.flair && <Badge variant="secondary">{post.flair}</Badge>}
                  <Badge variant="outline">{post.category}</Badge>
                </View>
              </View>
              {isAuthor && (
                <Pressable onPress={handleDeletePost} style={styles.deleteButton}>
                  <Trash2 size={20} color="#ef4444" />
                </Pressable>
              )}
            </View>
          </CardHeader>
          <CardContent>
            <Text style={styles.postContent}>
              {post.content}
            </Text>

            <View style={styles.postActions}>
              <View style={styles.voteContainer}>
                <Pressable onPress={() => handleVote("up")} style={styles.voteButton}>
                  <ArrowBigUp
                    size={28}
                    color={post.userVote === "up" ? "#ec4899" : "#64748b"}
                    fill={post.userVote === "up" ? "#ec4899" : "transparent"}
                  />
                </Pressable>
                <Text style={styles.voteCount}>
                  {post.votes}
                </Text>
                <Pressable onPress={() => handleVote("down")} style={styles.voteButton}>
                  <ArrowBigDown
                    size={28}
                    color={post.userVote === "down" ? "#2563eb" : "#64748b"}
                    fill={post.userVote === "down" ? "#2563eb" : "transparent"}
                  />
                </Pressable>
              </View>

              <Pressable onPress={() => setIsCommentDialogOpen(true)} style={styles.commentAction}>
                <MessageSquare size={20} color="#64748b" style={styles.actionIcon} />
                <Text style={styles.actionText}>Comment</Text>
              </Pressable>

              <Pressable onPress={handleBookmark} style={styles.bookmarkButton}>
                {post.bookmarked ? (
                  <BookmarkCheck size={20} color="#ec4899" fill="#ec4899" />
                ) : (
                  <Bookmark size={20} color="#64748b" />
                )}
              </Pressable>
            </View>
          </CardContent>
        </Card>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>
            Comments ({post.comments?.length || 0})
          </Text>

          {isLoadingComments ? (
            <ActivityIndicator color="#ec4899" style={styles.loadingIndicator} />
          ) : !post.comments || post.comments.length === 0 ? (
            <EmptyState title="No comments yet" description="Be the first to share your thoughts!" />
          ) : (
            post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                formatDate={formatDate}
                postId={post.id}
                onReplySuccess={() => loadComments(post.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CommentDialog
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        value={commentText}
        onChange={setCommentText}
        onSubmit={handleAddComment}
      />
    </SafeAreaView>
  );
};

const CommentItem = ({
  comment,
  formatDate,
  postId,
  onReplySuccess
}: {
  comment: Comment;
  formatDate: (date: Date | string) => string;
  postId: string | number;
  onReplySuccess: () => void;
}) => {
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { showToast } = useToast();

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    try {
      await commentsAPI.create(String(postId), {
        content: replyText,
        parentCommentId: Number(comment.id),
      });
      onReplySuccess();
      setReplyText("");
      setIsReplyDialogOpen(false);
      showToast("Reply added", "success");
    } catch (error: any) {
      showToast("Failed to add reply", "error");
    }
  };

  const totalReplies = comment.replies?.length || 0;

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{comment.author}</Text>
        <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>

      <Pressable
        onPress={() => setIsReplyDialogOpen(true)}
        style={styles.replyButton}
      >
        <MessageSquare size={14} color="#64748b" style={styles.replyIcon} />
        <Text style={styles.replyText}>
          Reply {totalReplies > 0 ? `(${totalReplies})` : ''}
        </Text>
      </Pressable>

      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthorSmall}>{reply.author}</Text>
                <Text style={styles.commentDateSmall}>{formatDate(reply.createdAt)}</Text>
              </View>
              <Text style={styles.commentContentSmall}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}

      <ReplyDialog
        open={isReplyDialogOpen}
        onOpenChange={setIsReplyDialogOpen}
        replyingTo={comment.author}
        value={replyText}
        onChange={setReplyText}
        onSubmit={handleReplySubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#0f172a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  postCard: {
    marginBottom: 24,
  },
  postHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  postHeaderText: {
    flex: 1,
  },
  postTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  postMeta: {
    fontSize: 12,
    color: '#64748b', // muted-foreground
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 24,
    marginBottom: 24,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0', // border
    paddingTop: 12,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteButton: {
    padding: 8,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
    color: '#0f172a',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  actionIcon: {
    marginRight: 0,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  bookmarkButton: {
    padding: 8,
  },
  commentsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingIndicator: {
    paddingVertical: 40,
  },
  commentItem: {
    backgroundColor: '#ffffff', // card
    borderWidth: 1,
    borderColor: '#e2e8f0', // border
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  commentDate: {
    fontSize: 12,
    color: '#64748b',
  },
  commentContent: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 12,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyIcon: {
    marginRight: 0,
  },
  replyText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 16,
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 107, 107, 0.2)', // primary/20
    gap: 12,
  },
  replyItem: {
    backgroundColor: '#f1f5f9', // muted
    padding: 12,
    borderRadius: 8,
  },
  commentAuthorSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  commentDateSmall: {
    fontSize: 10,
    color: '#64748b',
  },
  commentContentSmall: {
    fontSize: 12,
    color: '#0f172a',
  },
});

export default PostDetail;

