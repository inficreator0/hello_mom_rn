import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, ArrowBigUp, ArrowBigDown, MessageSquare, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { usePostsStore } from "../store/postsStore";
import { postsAPI, commentsAPI } from "../lib/api/posts";
import CommentDialog from "../components/common/CommentDialog";
import ReplyDialog from "../components/common/ReplyDialog";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import { useState, useEffect } from "react";
import { Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/common/EmptyState";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPostById, updatePost, refreshPosts, removePost, loadComments, toggleBookmark } = usePostsStore();
  const post = id ? getPostById(id) : undefined;
  const { user } = useAuth();
  const { showToast } = useToast();

  // Ensure we have the latest post + comments when navigating directly to this page
  useEffect(() => {
    let isMounted = true;

    if (id && !post) {
      void refreshPosts();
    }

    return () => {
      isMounted = false;
    };
  }, [id, post, refreshPosts]);

  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Only load comments if we have a post, and we haven't loaded them for this ID yet
    if (id && post && loadedPostId !== id) {
      const fetchComments = async () => {
        if (!isMounted) return;
        setIsLoadingComments(true);
        try {
          await loadComments(id);
          if (isMounted) {
            setLoadedPostId(id);
          }
        } catch (error) {
          console.error("Failed to load comments:", error);
        } finally {
          if (isMounted) {
            setIsLoadingComments(false);
          }
        }
      };
      fetchComments();
    }

    return () => {
      isMounted = false;
    };
  }, [id, post, loadedPostId, loadComments]);

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");

  if (!post) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Post not found</p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/community")}
            >
              Back to Community
            </Button>
          </CardContent>
        </Card>
      </div>
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
      hour: "2-digit",
      minute: "2-digit",
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

    // Persist vote to backend; rollback on failure
    try {
      if (voteType === "up") {
        await postsAPI.upvote(String(post.id));
      } else {
        await postsAPI.downvote(String(post.id));
      }
    } catch (error: any) {
      console.error("Error updating vote:", error);
      // Roll back optimistic update
      updatePost(post.id, (currentPost) => ({
        ...currentPost,
        votes: previousVotes,
        userVote: previousVote ?? null,
      }));
      alert(error.message || "Failed to update vote. Please try again.");
    }
  };

  const handleBookmark = async () => {
    try {
      await toggleBookmark(post.id);
    } catch (error: any) {
      showToast(error.message || "Failed to update bookmark", "error");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !id) return;

    try {
      await commentsAPI.create(id, {
        content: commentText,
      });

      await refreshPosts();
      setCommentText("");
      setIsCommentDialogOpen(false);
      showToast("Comment added", "success");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      showToast(error.message || "Failed to add comment. Please try again.", "error");
    }
  };

  const handleReply = async (commentId: string | number, replyContent: string) => {
    if (!id) return;

    try {
      await commentsAPI.create(id, {
        content: replyContent,
        parentCommentId: Number(commentId),
      });

      await refreshPosts();
      setReplyText("");
      setIsReplyDialogOpen(false);
      setSelectedCommentId(null);
      showToast("Reply added", "success");
    } catch (error: any) {
      console.error("Error adding reply:", error);
      showToast(error.message || "Failed to add reply. Please try again.", "error");
    }
  };

  const openReplyDialog = (commentId: string) => {
    setSelectedCommentId(commentId);
    setIsReplyDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      await postsAPI.delete(id);
      removePost(post.id);
      navigate("/community");
      showToast("Post deleted", "success");
    } catch (error: any) {
      console.error("Error deleting post:", error);
      showToast(error.message || "Failed to delete post. Please try again.", "error");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/community")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        <Card className="mb-6 border border-border/60 shadow-sm bg-card/95 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CardTitle className="text-base">{post.title}</CardTitle>

                </div>
                <CardDescription className="text-[10px] mb-[4px]">
                  by {post.author} • {formatDate(post.createdAt)}
                  {post.updatedAt ? ` • Updated` : ''}
                </CardDescription>
                <div className="flex gap-2">
                  {post.flair && <Badge variant="secondary">{post.flair}</Badge>}
                  <Badge variant="outline">{post.category}</Badge></div>
              </div>
              {isAuthor && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteClick}
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap mb-6 text-sm leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 flex-wrap border-t pt-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-transparent"
                  onClick={() => handleVote("up")}
                  aria-label="Upvote"
                >
                  <ArrowBigUp
                    className={`h-5 w-5 ${post.userVote === "up" ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                  />
                </Button>
                <span className={`font-bold min-w-[2rem] text-center text-lg ${post.userVote === "up" ? "text-primary" : post.userVote === "down" ? "text-blue-600" : ""}`}>
                  {post.votes}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-transparent"
                  onClick={() => handleVote("down")}
                  aria-label="Downvote"
                >
                  <ArrowBigDown
                    className={`h-5 w-5 ${post.userVote === "down" ? "text-blue-600 fill-blue-600" : "text-muted-foreground hover:text-blue-600"
                      }`}
                  />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCommentDialogOpen(true)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                aria-label={post.bookmarked ? "Unbookmark" : "Bookmark"}
              >
                {post.bookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75">
          <div className="flex items-center justify-between">
            <h2 className="text font-semibold">
              Comments ({post.comments.length})
            </h2>
          </div>

          {isLoadingComments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : post.comments.length === 0 ? (
            <EmptyState
              title="No comments yet"
              description="Be the first to share your thoughts!"
            />
          ) : (
            post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                formatDate={formatDate}
                onReply={openReplyDialog}
              />
            ))
          )}
        </div>

        <CommentDialog
          open={isCommentDialogOpen}
          onOpenChange={setIsCommentDialogOpen}
          value={commentText}
          onChange={setCommentText}
          onSubmit={handleAddComment}
        />

        {selectedCommentId && (
          <ReplyDialog
            open={isReplyDialogOpen}
            onOpenChange={setIsReplyDialogOpen}
            replyingTo={post.comments.find((c) => c.id === selectedCommentId)?.author}
            value={replyText}
            onChange={setReplyText}
            onSubmit={() => selectedCommentId && handleReply(selectedCommentId, replyText)}
          />
        )}

        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Post"
          description="Are you sure you want to delete this post? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  formatDate,
  onReply,
}: {
  comment: Comment;
  formatDate: (date: Date | string) => string;
  onReply: (commentId: string) => void;
}) => {
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { refreshPosts } = usePostsStore();

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      await commentsAPI.create(String(comment.postId), {
        content: replyText,
        parentCommentId: Number(comment.id),
      });

      // Refresh to get updated comments
      await refreshPosts();
      setReplyText("");
      setIsReplyDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding reply:", error);
      alert(error.message || "Failed to add reply. Please try again.");
    }
  };

  const totalReplies = comment.replies?.length || 0;

  return (
    <>
      <Card>
        <CardContent className="pt-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-semibold">{comment.author}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </p>
            </div>
            <p className="text-sm mb-3">{comment.content}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsReplyDialogOpen(true)}
            >
              <MessageSquare className="mr-1 h-3 w-3" />
              Reply {totalReplies > 0 && `(${totalReplies})`}
            </Button>
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 ml-4 space-y-3 border-l-2 border-primary/20 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-background/70 rounded-md p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-medium">{reply.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(reply.createdAt)}
                      </p>
                    </div>
                    <p className="text-xs">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <ReplyDialog
        open={isReplyDialogOpen}
        onOpenChange={setIsReplyDialogOpen}
        replyingTo={comment.author}
        value={replyText}
        onChange={setReplyText}
        onSubmit={handleReplySubmit}
      />
    </>
  );
};

export default PostDetail;

