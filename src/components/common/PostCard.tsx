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
} from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";
import { usePostsStore } from "../../store/postsStore";
import { useNavigate } from "react-router-dom";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleReportSubmit = (reason: string) => {
    if (onReport) {
      onReport(post.id, reason);
    }
    setIsReportDialogOpen(false);
  };

  return (
    <>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{post.title}</CardTitle>
            </div>

            <CardDescription className="text-[10px] mb-[4px]">
              by {post.author} • {formatDate(post.createdAt)}
            </CardDescription>
            <div className="flex gap-2">
              {post.flair && <Badge variant="secondary">{post.flair}</Badge>}
              <Badge variant="outline">{post.category}</Badge>
            </div>
          </div>

          {showActions && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-8 z-20 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 bg-[white]">
                    {isAuthor && onEdit && (
                      <button
                        className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onEdit(post);
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {isAuthor && onDelete && (
                      <button
                        className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive hover:text-destructive-foreground text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    )}
                    {!isAuthor && onReport && (
                      <button
                        className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          setIsReportDialogOpen(true);
                        }}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (onDelete) {
            onDelete(post.id);
            setIsDeleteDialogOpen(false);
          }
        }}
        isLoading={false}
      />

      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onSubmit={handleReportSubmit}
      />
    </>
  );
};

/* CONTENT */
const PostCardContent = ({ content }: { content: string }) => (
  <CardContent className="pb-0">
    <p className="whitespace-pre-wrap mb-1 text-sm">{content}</p>
  </CardContent>
);

/* ACTIONS */
interface PostCardActionsProps {
  post: Post;
  onVote?: (postId: string | number, voteType: "up" | "down") => void;
  onBookmark?: (postId: string | number) => void;
  onToggleComments: (e: React.MouseEvent) => void;
}

const PostCardActions = ({ post, onVote, onBookmark, onToggleComments }: PostCardActionsProps) => {
  const navigate = useNavigate();
  return (
    <CardContent className="py-0">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Voting */}
        {onVote && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent" onClick={(e) => { e.stopPropagation(); onVote(post.id, "up"); }}>
              <ArrowBigUp
                className={`h-5 w-5 ${post.userVote === "up" ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary"}`}
              />
            </Button>

            <span className={`font-bold min-w-[2rem] text-center ${post.userVote === "up" ? "text-primary" : post.userVote === "down" ? "text-blue-600" : ""}`}>
              {post.votes}
            </span>

            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent" onClick={(e) => { e.stopPropagation(); onVote(post.id, "down"); }}>
              <ArrowBigDown
                className={`h-5 w-5 ${post.userVote === "down" ? "text-blue-600 fill-blue-600" : "text-muted-foreground hover:text-blue-600"}`}
              />
            </Button>
          </div>
        )}

        {/* Comment Button (Navigates to detail) */}
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          navigate(`/post/${post.id}`);
        }}>
          <MessageSquare className="mr-2 h-4 w-4" />
          {post.commentCount || 0}
        </Button>

        {/* Bookmark */}
        {onBookmark && (
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onBookmark(post.id); }}>
            {post.bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </CardContent>
  );
};

/* FOOTER (Add Comment Input Trigger) */
const PostCardFooter = ({ postId }: { postId: string | number }) => {
  const navigate = useNavigate();

  return (
    <CardFooter className="pt-0 pb-1">
      <Button
        variant="ghost"
        className="text-sm text-muted-foreground hover:text-primary w-full justify-start pl-0"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/post/${postId}`);
        }}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Add a comment...
      </Button>
    </CardFooter>
  );
};

/* ---------------------------------------------
   MAIN COMPONENT
---------------------------------------------- */

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
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleReport = (id: string | number, reason: string) => {
    if (onReport) {
      onReport(id, reason);
    } else {
      // Default report handler
      showToast(`Post reported: ${reason.slice(0, 20)}...`, "success");
    }
  };

  const defaultFormatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const format = formatDate || defaultFormatDate;

  const isAuthor =
    !!user &&
    (user.userId === post.authorId ||
      user.id === post.authorId ||
      (!!user.username && !!post.authorUsername && user.username === post.authorUsername));

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest('[role="button"]')) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>

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
          onToggleComments={(e) => {
            e.stopPropagation();
            navigate(`/post/${post.id}`);
          }}
        />
      )}

      {showActions && <PostCardFooter postId={post.id} />}
    </Card>
  );
});

/* ---------------------------------------------
   COMMENT ITEM
---------------------------------------------- */
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
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-medium">{comment.author}</p>
          <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
        </div>

        <p className="text-sm mb-2">{comment.content}</p>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setIsReplyDialogOpen(true)}
        >
          <Reply className="mr-1 h-3 w-3" />
          Reply {totalReplies > 0 && `(${totalReplies})`}
        </Button>

        {totalReplies > 0 && (
          <div className="mt-3 ml-4 space-y-2 border-l-2 border-primary/20 pl-3">
            {comment.replies?.map((reply) => (
              <div key={reply.id} className="bg-background/50 rounded-md p-2">
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

export default PostCard;
