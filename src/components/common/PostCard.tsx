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
} from "lucide-react-native";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
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
    <CardHeader>
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

            {isMenuOpen && (
              <View style={styles.menuDropdown}>
                {isAuthor && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      onEdit(post);
                    }}
                  >
                    <Edit2 size={14} color="#0f172a" style={styles.menuIcon} />
                    <Text style={styles.menuText}>Edit</Text>
                  </Button>
                )}
                {isAuthor && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      handleDeletePress();
                    }}
                  >
                    <Trash2 size={14} color="#ef4444" style={styles.menuIcon} />
                    <Text style={[styles.menuText, styles.destructiveText]}>Delete</Text>
                  </Button>
                )}
                {!isAuthor && onReport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setIsReportDialogOpen(true);
                    }}
                  >
                    <Flag size={14} color="#0f172a" style={styles.menuIcon} />
                    <Text style={styles.menuText}>Report</Text>
                  </Button>
                )}
              </View>
            )}
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
        {/* Voting */}
        {onVote && (
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
        )}

        {/* Comment Button */}
        <Button variant="ghost" size="sm" onPress={() => navigation.navigate("PostDetail", { id: post.id })}>
          <MessageSquare size={16} color="#64748b" style={styles.actionIcon} />
          <Text style={styles.actionText}>{post.commentCount || 0}</Text>
        </Button>

        {/* Bookmark */}
        {onBookmark && (
          <Button variant="ghost" size="icon" onPress={() => onBookmark(post.id)}>
            <Bookmark
              size={18}
              color={post.bookmarked ? "#ec4899" : "#94a3b8"}
              fill={post.bookmarked ? "#ec4899" : "transparent"}
            />
          </Button>
        )}
      </View>
    </CardContent>
  );
};

/* FOOTER */
const PostCardFooter = ({ postId }: { postId: string | number }) => {
  const navigation = useNavigation<any>();

  return (
    <CardFooter style={styles.footerPadding}>
      <Button
        variant="ghost"
        style={styles.fullWidthButton}
        onPress={() => navigation.navigate("PostDetail", { id: postId })}
      >
        <MessageSquare size={16} color="#64748b" style={styles.actionIcon} />
        <Text style={styles.mutedText}>Add a comment...</Text>
      </Button>
    </CardFooter>
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
    return dateObj.toLocaleDateString();
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
      style={styles.pressableMargin}
    >
      <Animated.View style={animatedStyle}>
        <Card>
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

          {showActions && <PostCardFooter postId={post.id} />}
        </Card>
      </Animated.View>
    </Pressable>
  );
});

const CommentItem = ({
  comment,
  formatDate,
  postId,
  onReply,
}: {
  comment: Comment;
  formatDate: (date: Date | string) => string;
  postId: string | number;
  onReply?: (
    postId: string | number,
    commentId: string | number,
    replyContent: string
  ) => void;
}) => {
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    if (!replyText.trim() || !onReply) return;
    onReply(postId, String(comment.id), replyText);
    setReplyText("");
    setIsReplyDialogOpen(false);
  };

  const totalReplies = comment.replies?.length || 0;

  return (
    <>
      <View style={styles.commentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.authorText}>{comment.author}</Text>
          <Text style={styles.dateText}>{formatDate(comment.createdAt)}</Text>
        </View>

        <Text style={styles.commentContentText}>{comment.content}</Text>

        <Button
          variant="ghost"
          size="sm"
          style={styles.replyButton}
          onPress={() => setIsReplyDialogOpen(true)}
        >
          <Reply size={12} color="#64748b" style={styles.actionIcon} />
          <Text style={styles.xsText}>Reply {totalReplies > 0 && `(${totalReplies})`}</Text>
        </Button>

        {totalReplies > 0 && (
          <View style={styles.repliesWrapper}>
            {comment.replies?.map((reply) => (
              <View key={reply.id} style={styles.replyContainer}>
                <View style={styles.headerContainer}>
                  <Text style={styles.authorTextXs}>{reply.author}</Text>
                  <Text style={styles.dateText}>{formatDate(reply.createdAt)}</Text>
                </View>
                <Text style={styles.replyContentText}>{reply.content}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <ReplyDialog
        open={isReplyDialogOpen}
        onOpenChange={setIsReplyDialogOpen}
        replyingTo={comment.author}
        value={replyText}
        onChange={setReplyText}
        onSubmit={submitReply}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
  menuDropdown: {
    position: 'absolute',
    right: 0,
    top: 40,
    zIndex: 20,
    minWidth: 120,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0', // border
    backgroundColor: '#ffffff', // card
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    paddingBottom: 0,
  },
  contentText: {
    marginBottom: 4,
    fontSize: 14,
    color: '#0f172a', // foreground
  },
  actionsPadding: {
    paddingBottom: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  votingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteButton: {
    height: 32,
    width: 32,
  },
  voteCount: {
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
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
  },
  footerPadding: {
    paddingTop: 0,
    paddingBottom: 4,
  },
  fullWidthButton: {
    fontSize: 14,
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  mutedText: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
  },
  pressableMargin: {
    marginBottom: 16,
  },
  commentContainer: {
    backgroundColor: 'rgba(241, 245, 249, 0.5)', // muted/50
    borderRadius: 8,
    padding: 12,
  },
  commentContentText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#0f172a',
  },
  authorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  authorTextXs: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  replyButton: {
    height: 28,
    paddingHorizontal: 8,
  },
  xsText: {
    fontSize: 12,
  },
  repliesWrapper: {
    marginTop: 12,
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 107, 107, 0.2)', // primary/20
    paddingLeft: 12,
  },
  replyContainer: {
    backgroundColor: '#ffffff', // card
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  replyContentText: {
    fontSize: 12,
    color: '#0f172a',
  },
});

export { PostCard, CommentItem };
export default PostCard;
