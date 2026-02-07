import {
  Edit2,
  Trash2,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Reply,
  Loader2,
  MoreVertical,
  Flag,
  Share2,
} from "lucide-react-native";
import { View, Text, Pressable, Alert, StyleSheet, Share } from "react-native";
import * as Linking from 'expo-linking';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/bottom-sheet";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import ConfirmationDialog from "./ConfirmationDialog";
import { usePostsStore } from "../../store/postsStore";
import { useNavigation } from "@react-navigation/native";
import { useToast } from "../../context/ToastContext";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Post, Comment } from "../../types";
import { useState, memo } from "react";
import { useAuth } from "../../context/AuthContext";
import ReplyDialog from "./ReplyDialog";
import ReportDialog from "./ReportDialog";

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string | number) => void;
  onVote?: (postId: string | number, voteType: "up" | "down") => void;
  onBookmark?: (postId: string | number) => void;
  onReply?: (
    postId: string | number,
    commentId: string | number,
    replyContent: string
  ) => void;
  formatDate?: (date: Date | string) => string;
  showActions?: boolean;
  onReport?: (postId: string | number, reason: string) => void;
  /** When true, card has shadow/elevation for a tappable, raised appearance */
  elevated?: boolean;
}

/* ---------------------------------------------
   SUB-COMPONENTS
---------------------------------------------- */

/* HEADER */
interface PostCardHeaderProps {
  post: Post;
  isAuthor: boolean;
  formatDate: (date: Date | string) => string;
  showActions: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string | number) => void;
  onReport?: (postId: string | number, reason: string) => void;
}

const PostCardHeader = ({ post, isAuthor, formatDate, showActions, onEdit, onDelete, onReport }: PostCardHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleReportSubmit = (reason: string) => {
    if (onReport) {
      onReport(post.id, reason);
    }
    setIsReportDialogOpen(false);
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete && onDelete(post.id)
        }
      ]
    );
  };

  return (
    <CardHeader style={{ padding: 12, paddingLeft: 24 }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <CardTitle style={styles.titleText}>{post.title}</CardTitle>
          <CardDescription style={styles.descriptionText}>
            by {post.author} • {formatDate(post.createdAt)}
          </CardDescription>
          <View style={styles.badgeContainer}>
            {post.flair && <Badge variant="secondary">{post.flair}</Badge>}
            <Badge variant="outline">{post.category}</Badge>
          </View>
        </View>

        {showActions && (
          <View style={styles.menuWrapper}>
            <Button
              variant="ghost"
              size="icon"
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical color="#0f172a" size={16} />
            </Button>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetContent style={styles.sheetContent}>
                <SheetHeader>
                  <SheetTitle>Post Actions</SheetTitle>
                </SheetHeader>
                <View style={styles.actionList}>
                  {isAuthor && onEdit && (
                    <Pressable
                      style={styles.actionItem}
                      onPress={() => {
                        setIsMenuOpen(false);
                        onEdit(post);
                      }}
                    >
                      <View style={[styles.actionIconContainer, { backgroundColor: '#f1f5f9' }]}>
                        <Edit2 size={20} color="#0f172a" />
                      </View>
                      <Text style={styles.actionItemText}>Edit Post</Text>
                    </Pressable>
                  )}
                  {isAuthor && onDelete && (
                    <Pressable
                      style={styles.actionItem}
                      onPress={() => {
                        setIsMenuOpen(false);
                        handleDeletePress();
                      }}
                    >
                      <View style={[styles.actionIconContainer, { backgroundColor: '#fef2f2' }]}>
                        <Trash2 size={20} color="#ef4444" />
                      </View>
                      <Text style={[styles.actionItemText, { color: '#ef4444' }]}>Delete Post</Text>
                    </Pressable>
                  )}
                  {!isAuthor && onReport && (
                    <Pressable
                      style={styles.actionItem}
                      onPress={() => {
                        setIsMenuOpen(false);
                        setIsReportDialogOpen(true);
                      }}
                    >
                      <View style={[styles.actionIconContainer, { backgroundColor: '#f1f5f9' }]}>
                        <Flag size={20} color="#0f172a" />
                      </View>
                      <Text style={styles.actionItemText}>Report Post</Text>
                    </Pressable>
                  )}
                </View>
              </SheetContent>
            </Sheet>
          </View>
        )}
      </View>
      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onSubmit={handleReportSubmit}
      />
    </CardHeader>
  );
};

/* CONTENT */
const PostCardContent = ({ content }: { content: string }) => (
  <CardContent style={styles.contentPadding}>
    <Text style={styles.contentText} numberOfLines={4} ellipsizeMode="tail">{content}</Text>
  </CardContent>
);

/* ACTIONS */
interface PostCardActionsProps {
  post: Post;
  onVote?: (postId: string | number, voteType: "up" | "down") => void;
  onBookmark?: (postId: string | number) => void;
  onToggleComments: () => void;
}

const PostCardActions = ({ post, onVote, onBookmark, onToggleComments }: PostCardActionsProps) => {
  const navigation = useNavigation<any>();
  return (
    <CardContent style={styles.actionsPadding}>
      <View style={styles.actionsRow}>
        {/* Voting Chip */}
        {onVote && (
          <View style={styles.actionChip}>
            <View style={styles.votingContainer}>
              <Button variant="ghost" size="icon" style={styles.voteButton} onPress={() => onVote(post.id, "up")}>
                <ArrowBigUp
                  size={20}
                  color={post.userVote === "up" ? "#ec4899" : "#94a3b8"}
                  fill={post.userVote === "up" ? "#ec4899" : "transparent"}
                />
              </Button>

              <Text style={[
                styles.voteCount,
                post.userVote === "up" ? styles.primaryText : post.userVote === "down" ? styles.blueText : styles.foregroundText
              ]}>
                {post.votes}
              </Text>

              <Button variant="ghost" size="icon" style={styles.voteButton} onPress={() => onVote(post.id, "down")}>
                <ArrowBigDown
                  size={20}
                  color={post.userVote === "down" ? "#2563eb" : "#94a3b8"}
                  fill={post.userVote === "down" ? "#2563eb" : "transparent"}
                />
              </Button>
            </View>
          </View>
        )}

        {/* Comment Chip */}
        <View style={styles.actionChip}>
          <Button variant="ghost" size="sm" style={styles.chipButton} onPress={() => navigation.navigate("PostDetail", { id: post.id })}>
            <MessageSquare size={16} color="#64748b" style={styles.actionIcon} />
            <Text style={styles.actionText}>{post.commentCount || 0}</Text>
          </Button>
        </View>

        {/* Share Chip */}
        <View style={styles.actionChip}>
          <Button
            variant="ghost"
            size="icon"
            style={styles.chipButton}
            onPress={async () => {
              try {
                const postLink = Linking.createURL(`post/${post.id}`);
                await Share.share({
                  message: `${post.title}\n\nCheck out this post on Nova: ${postLink}`,
                  url: postLink,
                });
              } catch (error) {
                console.error("Error sharing post:", error);
              }
            }}
          >
            <Share2 size={18} color="#94a3b8" />
          </Button>
        </View>

        {/* Bookmark Chip */}
        {onBookmark && (
          <View style={styles.actionChip}>
            <Button variant="ghost" size="icon" style={styles.chipButton} onPress={() => onBookmark(post.id)}>
              <Bookmark
                size={18}
                color={post.bookmarked ? "#ec4899" : "#94a3b8"}
                fill={post.bookmarked ? "#ec4899" : "transparent"}
              />
            </Button>
          </View>
        )}
      </View>
    </CardContent>
  );
};

/* MAIN COMPONENT */
const PostCard = memo(({
  post,
  onEdit,
  onDelete,
  onVote,
  onBookmark,
  onReply,
  onReport,
  formatDate,
  showActions = true,
  elevated = false,
}: PostCardProps) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleReport = (id: string | number, reason: string) => {
    if (onReport) {
      onReport(id, reason);
    } else {
      showToast(`Post reported: ${reason.slice(0, 20)}...`, "success");
    }
  };

  const defaultFormatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const format = formatDate || defaultFormatDate;

  const isAuthor =
    !!user &&
    (user.userId === post.authorId ||
      user.id === post.authorId ||
      (!!user.username && !!post.authorUsername && user.username === post.authorUsername));

  return (
    <Pressable
      onPress={() => navigation.navigate("PostDetail", { id: post.id })}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.pressableMargin, elevated && styles.pressableElevated]}
    >
      <Animated.View style={animatedStyle}>
        <Card style={[styles.cardOverride, elevated && styles.cardElevated]}>
          <PostCardHeader
            post={post}
            isAuthor={isAuthor}
            formatDate={format}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={handleReport}
          />

          <PostCardContent content={post.content} />

          {showActions && (
            <PostCardActions
              post={post}
              onVote={onVote}
              onBookmark={onBookmark}
              onToggleComments={() => navigation.navigate("PostDetail", { id: post.id })}
            />
          )}

          {/* {showActions && <PostCardFooter postId={post.id} />} */}
        </Card>
      </Animated.View>
    </Pressable>
  );
});


const styles = StyleSheet.create({
  cardOverride: {
    borderRadius: 12,
    shadowOpacity: 0,
    elevation: 0,
  },
  cardElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
  },
  descriptionText: {
    fontSize: 10,
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  menuWrapper: {
    position: 'relative',
  },
  menuButton: {
    height: 32,
    width: 32,
  },
  sheetContent: {
    paddingBottom: 40,
  },
  actionList: {
    gap: 8,
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  menuItem: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    fontSize: 14,
  },
  destructiveText: {
    color: '#ef4444',
  },
  contentPadding: {
    paddingBottom: 4,
  },
  contentText: {
    marginBottom: 4,
    fontSize: 14,
    color: '#0f172a', // foreground
  },
  actionsPadding: {
    paddingBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionChip: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    overflow: "hidden",
    flexShrink: 0,
  },
  chipButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 0, // Let the parent View handle rounding
  },
  votingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  voteButton: {
    height: 32,
    width: 32,
    flexShrink: 0,
  },
  voteCount: {
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
    fontSize: 14,
  },
  primaryText: {
    color: '#ec4899',
  },
  blueText: {
    color: '#2563eb',
  },
  foregroundText: {
    color: '#0f172a',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '500',
  },
  fullWidthButton: {
    fontSize: 14,
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  pressableMargin: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
  },
  pressableElevated: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default PostCard;
