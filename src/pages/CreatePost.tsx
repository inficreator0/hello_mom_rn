import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { CommunityCategory, PostFormData } from "../types";
import { usePostsStore, transformPost } from "../store/postsStore";
import { postsAPI } from "../lib/api/posts";
import { useToast } from "../context/ToastContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import MultiSelect from "../components/common/MultiSelect";

const CATEGORIES: CommunityCategory[] = ["Pregnancy", "Postpartum", "Feeding", "Sleep", "Mental Health", "Recovery", "Milestones"];

const FLAIR_OPTIONS = [
    "Question",
    "Advice Needed",
    "Vent",
    "Success Story",
    "Discussion",
    "Resource",
    "Other"
];

const CreatePost = () => {
    const navigation = useNavigation<any>();
    const { addPost, updatePost } = usePostsStore(); // Add updatePost from store
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check for edit mode
    const route = useRoute();
    const editingPost = (route.params as any)?.post;
    const isEditMode = !!editingPost;

    const [formData, setFormData] = useState<PostFormData>({
        title: editingPost?.title || "",
        content: editingPost?.content || "",
        category: editingPost?.category ? editingPost.category.split(",") : [],
        flair: editingPost?.flair ? editingPost.flair.split(",") : [],
    });

    const handleChange = (field: keyof PostFormData, value: string | string[]) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim()) return;

        setIsSubmitting(true);
        try {
            const postData = {
                title: formData.title,
                content: formData.content,
                category: formData.category.join(","),
                flair: formData.flair.join(","),
            };

            if (isEditMode) {
                const updatedBackendPost = await postsAPI.update(editingPost.id, postData);
                const updatedPost = transformPost(updatedBackendPost);
                updatePost(editingPost.id, (p) => ({ ...p, ...updatedPost })); // Update store
                showToast("Post updated successfully", "success");
            } else {
                const backendPost = await postsAPI.create(postData);
                const newPost = transformPost(backendPost);
                addPost(newPost);
                showToast("Post created successfully", "success");
            }

            navigation.goBack();
        } catch (error: any) {
            console.error("Error saving post:", error);
            showToast(isEditMode ? "Failed to update post" : "Failed to create post", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDisabled = isSubmitting || !formData.title.trim() || !formData.content.trim();

    return (
        <PageContainer style={styles.container} edges={['top']}>
            <ScreenHeader title={isEditMode ? "Edit Post" : "Create Post"} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex1}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <Card style={styles.postCard}>

                        <CardContent style={styles.cardContent}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Title</Text>
                                <Input
                                    placeholder="Enter title"
                                    value={formData.title}
                                    onChangeText={(text) => handleChange("title", text)}
                                    editable={!isSubmitting}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <MultiSelect
                                    label="Category"
                                    options={CATEGORIES}
                                    selectedValues={formData.category}
                                    onSelectionChange={(values) => handleChange("category", values)}
                                    placeholder="Select categories"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <MultiSelect
                                    label="Flair (Optional)"
                                    options={FLAIR_OPTIONS}
                                    selectedValues={formData.flair}
                                    onSelectionChange={(values) => handleChange("flair", values)}
                                    placeholder="Select flair"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Content</Text>
                                <TextInput
                                    style={styles.contentTextarea}
                                    placeholder="Write your post content here..."
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                    value={formData.content}
                                    onChangeText={(text) => handleChange("content", text)}
                                    editable={!isSubmitting}
                                />
                            </View>

                            <View style={styles.actionsRow}>
                                <Button
                                    variant="outline"
                                    style={styles.flex1}
                                    onPress={() => navigation.goBack()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    style={styles.flex1}
                                    onPress={handleSubmit}
                                    disabled={isDisabled}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.buttonText}>{isEditMode ? "Update" : "Post"}</Text>
                                    )}
                                </Button>
                            </View>
                        </CardContent>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
        fontSize: 16, // Reduced font size
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#0f172a',
    },
    flex1: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    postCard: {
        paddingVertical: 24,
    },
    cardContent: {
        gap: 24,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0f172a',
    },
    contentTextarea: {
        minHeight: 150,
        width: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0', // input
        backgroundColor: '#ffffff', // background
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#0f172a',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});

export default CreatePost;
