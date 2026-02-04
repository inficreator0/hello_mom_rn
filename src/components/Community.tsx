import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Post, PostFormData, Comment, CommunityCategory } from "../types";
import { postsAPI, commentsAPI } from "../lib/api/posts";
import SearchBar from "./common/SearchBar";
import PostCard from "./common/PostCard";
import PostFormDialog from "./common/PostFormDialog";
import CommentDialog from "./common/CommentDialog";
import CategoryTabs from "./common/CategoryTabs";
import { usePostsStore, transformPost } from "../store/postsStore";
import { useToast } from "../context/ToastContext";
import { PostCardSkeleton } from "./ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/bottom-sheet";
import { CommunityEmptyState } from "./common/CommunityEmptyState";

const CATEGORIES: CommunityCategory[] = ["All", "Pregnancy", "Postpartum", "Feeding", "Sleep", "Mental Health", "Recovery", "Milestones"];

const Community = () => {
  const { posts, updatePost, refreshPosts, isLoading, hasLoaded, addPost, removePost, hasMore, loadMorePosts, toggleBookmark, currentSort, currentCategory } = usePostsStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>((currentCategory as CommunityCategory) || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | number | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    category: "All",
    flair: "",
  });
  const [commentText, setCommentText] = useState("");

  // Load posts on mount (only if empty or category mismatch)
  useEffect(() => {
    void refreshPosts(selectedCategory);
  }, [selectedCategory, refreshPosts]);

  // Scroll restoration logic
  useEffect(() => {
    // Only restore scroll if we have posts and we are not currently loading
    if (posts.length > 0 && !isLoading) {
      const savedScrollPos = sessionStorage.getItem("community-scroll-pos");
      if (savedScrollPos && savedScrollPos !== "0") {
        // Disable browser's auto scroll restoration to prevent conflicts
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }

        // Use multiple attempts to ensure layout is ready and stable
        const timer1 = setTimeout(() => window.scrollTo(0, parseInt(savedScrollPos, 10)), 30);
        const timer2 = setTimeout(() => window.scrollTo(0, parseInt(savedScrollPos, 10)), 100);
        const timer3 = setTimeout(() => window.scrollTo(0, parseInt(savedScrollPos, 10)), 300);
        const timer4 = setTimeout(() => window.scrollTo(0, parseInt(savedScrollPos, 10)), 600);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          clearTimeout(timer4);
        };
      }
    }
  }, [posts.length, isLoading]);

  // Save scroll position
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Only save if it's a meaningful scroll position to avoid clearing on accidental resets
      if (currentScrollY > 0) {
        sessionStorage.setItem("community-scroll-pos", currentScrollY.toString());
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        void loadMorePosts();
      }
    },
    [hasMore, isLoading, loadMorePosts]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 1.0,
      rootMargin: "20px",
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category is now handled by backend, so we only filter by search query locally
      // Note: effective search would require backend support, this searches only loaded posts
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [posts, searchQuery]);

  const handleEditPost = async () => {
    if (!editingPost || !formData.title.trim() || !formData.content.trim()) {
      return;
    }

    try {
      const backendPost = await postsAPI.update(String(editingPost.id), {
        title: formData.title,
        content: formData.content,
        category: formData.category !== "All" ? formData.category : undefined,
        flair: formData.flair || undefined,
      });

      // Update the post locally without refetching the entire list
      updatePost(editingPost.id, (post) => {
        return {
          ...post,
          ...transformPost(backendPost),
        };
      });

      setEditingPost(null);
      setFormData({ title: "", content: "", category: "All", flair: "" });
      setIsEditDialogOpen(false);
      showToast("Post updated", "success");
    } catch (error: any) {
      console.error("Error updating post:", error);
      showToast(error.message || "Failed to update post. Please try again.", "error");
    }
  };

  const handleDeletePost = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postsAPI.delete(String(id));
        removePost(id);
        showToast("Post deleted", "success");
      } catch (error: any) {
        console.error("Error deleting post:", error);
        showToast(error.message || "Failed to delete post. Please try again.", "error");
      }
    }
  };

  const handleVote = async (postId: string | number, voteType: "up" | "down") => {
    const postIdStr = String(postId);
    const currentPost = posts.find((p) => String(p.id) === postIdStr);
    if (!currentPost) return;

    const previousVote = currentPost.userVote;
    const previousVotes = currentPost.votes;

    // Optimistic UI update
    updatePost(postId, (post) => {
      const currentVote = post.userVote;
      let newVotes = post.votes;

      if (currentVote === voteType) {
        newVotes += voteType === "up" ? -1 : 1;
        return { ...post, votes: newVotes, userVote: null };
      } else if (currentVote === null) {
        newVotes += voteType === "up" ? 1 : -1;
        return { ...post, votes: newVotes, userVote: voteType };
      } else {
        newVotes += voteType === "up" ? 2 : -2;
        return { ...post, votes: newVotes, userVote: voteType };
      }
    });

    // Persist vote to backend; rollback on failure
    try {
      if (voteType === "up") {
        await postsAPI.upvote(postIdStr);
      } else {
        await postsAPI.downvote(postIdStr);
      }
    } catch (error: any) {
      console.error("Error updating vote:", error);
      // Roll back optimistic update
      updatePost(postId, (post) => ({
        ...post,
        votes: previousVotes,
        userVote: previousVote ?? null,
      }));
      alert(error.message || "Failed to update vote. Please try again.");
    }
  };

  const handleBookmark = async (postId: string | number) => {
    try {
      await toggleBookmark(postId);
      const post = posts.find(p => String(p.id) === String(postId));
      // Toast logic can be added here if needed, but optimistic UI handles visual feedback
      // Maybe only show toast on error or if user explicitly wants confirmation
    } catch (error: any) {
      showToast(error.message || "Failed to update bookmark", "error");
    }
  };

  const handleReply = async (postId: string | number, commentId: string | number, replyContent: string) => {
    try {
      await commentsAPI.create(String(postId), {
        content: replyContent,
        parentCommentId: Number(commentId),
      });

      // Refresh posts to get updated comments
      await refreshPosts();
    } catch (error: any) {
      console.error("Error adding reply:", error);
      alert(error.message || "Failed to add reply. Please try again.");
    }
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
      flair: post.flair || "",
    });
    setIsEditDialogOpen(true);
  };

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

  // Scroll direction detection for sticky header
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 10);

      // Add threshold to prevent jerky behavior (hysteresis)
      const threshold = 15;
      const diff = currentScrollY - lastScrollY.current;

      if (currentScrollY < 10) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
      } else if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Scrolling down - hide header (if user wants "vanish" on scroll up? No, standard behavior restored)
          // Standard: Scroll Down -> Hide. Scroll Up -> Show.
          setShowHeader(false);
        } else {
          // Scrolling up - show header
          setShowHeader(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Posts are already sorted by backend (createdAt DESC) and store preserves order
  const sortedPosts = filteredPosts;

  return (
    <div className="pb-4">
      {/* Sticky Header Container */}
      <div
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
          ? "bg-primary/20 backdrop-blur-md shadow-sm border-b border-primary/20 supports-[backdrop-filter]:bg-primary/10"
          : ""
          }`}
      >
        {/* Header - hides on scroll direction */}
        <div
          className={`container mx-auto px-4 max-w-6xl transition-all duration-300 overflow-hidden ${showHeader ? "max-h-24 opacity-100 pt-8 pb-2" : "max-h-0 opacity-0 pt-0 pb-0"
            }`}
        >
          <div className="flex flex-row md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Community</h1>
              <p className="text-xs text-muted-foreground">Share, connect, and support each other</p>
            </div>
            <Button onClick={() => navigate("/create-post")} className="rounded-full px-4 shadow-md hover:shadow-lg transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Search & Categories - always sticky */}
        <div className="container mx-auto px-4 max-w-6xl py-3">
          <SearchBar
            placeholder="Search posts..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="mb-0"
            onFilterClick={() => setIsFilterOpen(true)}
          />
          {selectedCategory && selectedCategory !== "All" && (
            <div className="flex animate-in fade-in slide-in-from-top-1 duration-200 mt-2">
              <Badge
                variant="secondary"
                className="pl-3 pr-1 py-1 h-7 flex items-center gap-1 cursor-pointer hover:bg-secondary/80 transition-colors border-primary/20 bg-primary/10 text-primary"
                onClick={() => {
                  setSelectedCategory("All");
                  sessionStorage.removeItem("community-scroll-pos"); // Clear scroll on filter reset
                  refreshPosts("All", undefined, true); // Force refresh on explicit reset
                }}
              >
                {selectedCategory}
                <div className="rounded-full p-0.5 hover:bg-black/10 transition-colors">
                  <X className="h-3 w-3" />
                </div>
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent>
          <SheetHeader className="mb-4">
            <SheetTitle>Filter & Sort</SheetTitle>
          </SheetHeader>
          <div className="py-2 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Category</h3>
              <CategoryTabs
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onCategoryChange={(category) => {
                  setSelectedCategory(category);
                  sessionStorage.removeItem("community-scroll-pos"); // Clear scroll on category change
                  setIsFilterOpen(false);
                }}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Sort By</h3>
              <div className="flex gap-2">
                <Button
                  variant={currentSort === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (currentSort !== "recent") {
                      sessionStorage.removeItem("community-scroll-pos"); // Clear scroll on sort change
                      refreshPosts(selectedCategory, "recent", true); // Force refresh
                      setIsFilterOpen(false);
                    }
                  }}
                  className="rounded-full"
                >
                  Latest
                </Button>
                <Button
                  variant={currentSort === "upvotes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (currentSort !== "upvotes") {
                      sessionStorage.removeItem("community-scroll-pos"); // Clear scroll on sort change
                      refreshPosts(selectedCategory, "upvotes", true); // Force refresh
                      setIsFilterOpen(false);
                    }
                  }}
                  className="rounded-full"
                >
                  Most Upvoted
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto py-4 px-4 max-w-6xl animate-in fade-in-0 slide-in-from-bottom-2 duration-300">

        <PostFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Post"
          description="Update your post content below."
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleEditPost}
          categories={CATEGORIES}
          submitLabel="Update"
        />



        <div className="space-y-4">
          {isLoading && posts.length === 0 ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : sortedPosts.length === 0 ? (
            <CommunityEmptyState onAction={() => navigate("/create-post")} />
          ) : (
            sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={openEditDialog}
                onDelete={handleDeletePost}
                onVote={handleVote}
                onBookmark={handleBookmark}
                onReply={handleReply}
                formatDate={formatDate}
              />
            ))
          )}

          {sortedPosts.length > 0 && hasMore && (
            <div ref={observerTarget} className="pt-4 pb-8">
              {isLoading && <PostCardSkeleton />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;

