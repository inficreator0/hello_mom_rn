import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { CommunityCategory, PostFormData } from "../types";
import { usePostsStore, transformPost } from "../store/postsStore";
import { postsAPI } from "../lib/api/posts";
import { useToast } from "../context/ToastContext";

const CATEGORIES: CommunityCategory[] = ["All", "Pregnancy", "Postpartum", "Feeding", "Sleep", "Mental Health", "Recovery", "Milestones"];

const CreatePost = () => {
    const navigate = useNavigate();
    const { addPost } = usePostsStore();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<PostFormData>({
        title: "",
        content: "",
        category: "All",
        flair: "",
    });

    const handleChange = (field: keyof PostFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim()) return;

        setIsSubmitting(true);
        try {
            const backendPost = await postsAPI.create({
                title: formData.title,
                content: formData.content,
                category: formData.category !== "All" ? formData.category : undefined,
                flair: formData.flair || undefined,
            });

            const newPost = transformPost(backendPost);
            addPost(newPost);

            showToast("Post created successfully", "success");
            navigate("/community");
        } catch (error: any) {
            console.error("Error creating post:", error);
            showToast(error.message || "Failed to create post. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDisabled = isSubmitting || !formData.title.trim() || !formData.content.trim();

    return (
        <div className="pb-20">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/community")}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Community
                </Button>

                <Card className="border border-border/60 shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl">Create New Post</CardTitle>
                        <CardDescription>
                            Share your thoughts, ask questions, or offer support to the community.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-base">Title</Label>
                            <Input
                                id="title"
                                placeholder="What's on your mind?"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                disabled={isSubmitting}
                                className="text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-base">Category</Label>
                            <select
                                id="category"
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                disabled={isSubmitting}
                            >
                                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="flair" className="text-base">
                                Flair <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="flair"
                                placeholder="e.g., Question, Advice, Vent"
                                value={formData.flair || ""}
                                onChange={(e) => handleChange("flair", e.target.value)}
                                disabled={isSubmitting}
                                className="text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content" className="text-base">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Write your post content here..."
                                value={formData.content}
                                onChange={(e) => handleChange("content", e.target.value)}
                                rows={10}
                                disabled={isSubmitting}
                                className="resize-none min-h-[200px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/community")}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isDisabled}
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? "Posting..." : "Create Post"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreatePost;
