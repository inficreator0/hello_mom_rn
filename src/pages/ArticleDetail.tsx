import { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet, Share } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { PageContainer } from "../components/common/PageContainer";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { articlesAPI } from "../lib/api/articles";
import { Article } from "../types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/button";
import { Share2 } from "lucide-react-native";
import * as Linking from 'expo-linking';
import Markdown from 'react-native-markdown-display';
import { Platform } from 'react-native';

// Medium uses Georgia/Charter for body and system sans-serif for headings
const serifFont = Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
});

const sansFont = Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
});

// Markdown styles for Medium-like reading experience
const markdownStyles = {
    body: {
        fontSize: 18,
        color: '#292929',
        lineHeight: 32,
        fontFamily: serifFont,
    },
    heading1: {
        fontSize: 26,
        fontWeight: '700' as const,
        color: '#0f172a',
        marginTop: 32,
        marginBottom: 12,
        lineHeight: 32,
        fontFamily: sansFont,
        letterSpacing: -0.5,
    },
    heading2: {
        fontSize: 22,
        fontWeight: '600' as const,
        color: '#1e293b',
        marginTop: 28,
        marginBottom: 10,
        lineHeight: 28,
        fontFamily: sansFont,
        letterSpacing: -0.3,
    },
    heading3: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: '#334155',
        marginTop: 24,
        marginBottom: 8,
        lineHeight: 24,
        fontFamily: sansFont,
    },
    paragraph: {
        fontSize: 18,
        color: '#292929',
        lineHeight: 32,
        marginBottom: 16,
        fontFamily: serifFont,
    },
    strong: {
        fontWeight: '700' as const,
    },
    em: {
        fontStyle: 'italic' as const,
    },
    blockquote: {
        backgroundColor: 'transparent',
        borderLeftWidth: 3,
        borderLeftColor: '#0f172a',
        paddingVertical: 4,
        paddingLeft: 20,
        marginVertical: 16,
        fontFamily: serifFont,
        fontStyle: 'italic' as const,
    },
    code_inline: {
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 15,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    },
    code_block: {
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: 16,
        borderRadius: 8,
        fontSize: 14,
        marginVertical: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    },
    fence: {
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: 16,
        borderRadius: 8,
        fontSize: 14,
        marginVertical: 16,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    },
    bullet_list: {
        marginVertical: 12,
    },
    ordered_list: {
        marginVertical: 12,
    },
    list_item: {
        marginBottom: 8,
        fontFamily: serifFont,
    },
    bullet_list_icon: {
        color: '#292929',
        marginRight: 12,
    },
    ordered_list_icon: {
        color: '#292929',
        marginRight: 12,
    },
    link: {
        color: '#0f172a',
        textDecorationLine: 'underline' as const,
    },
    hr: {
        backgroundColor: '#e2e8f0',
        height: 1,
        marginVertical: 24,
    },
    image: {
        borderRadius: 8,
        marginVertical: 12,
    },
};

export const ArticleDetail = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const articleId = route.params?.id;
    const { showToast } = useToast();

    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!articleId) return;

            setIsLoading(true);
            try {
                const data = await articlesAPI.getById(Number(articleId), true);
                setArticle(data);
            } catch (error) {
                console.error("Failed to fetch article:", error);
                showToast("Failed to load article", "error");
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [articleId]);

    const handleShare = async () => {
        if (!article) return;

        try {
            const articleLink = Linking.createURL(`article/${article.id}`);
            await Share.share({
                message: `${article.title}\n\nRead this article on Nova: ${articleLink}`,
                url: articleLink,
            });
        } catch (error) {
            console.error("Error sharing article:", error);
        }
    };

    const formatDate = (date: string) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <PageContainer style={styles.container} edges={['top']}>
                <ScreenHeader title="Article" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ec4899" />
                </View>
            </PageContainer>
        );
    }

    if (!article) {
        return (
            <PageContainer style={styles.container} edges={['top']}>
                <ScreenHeader title="Article" />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Article not found</Text>
                </View>
            </PageContainer>
        );
    }

    return (
        <PageContainer style={styles.container} edges={['top']}>
            <ScreenHeader
                title="Article"
                rightElement={
                    <Button variant="ghost" size="icon" onPress={handleShare}>
                        <Share2 size={20} color="#0f172a" />
                    </Button>
                }
            />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {article.featuredImageUrl && (
                    <Image
                        source={{ uri: article.featuredImageUrl }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.contentContainer}>
                    <Text style={styles.category}>{article.category}</Text>
                    <Text style={styles.title}>{article.title}</Text>

                    <View style={styles.metaContainer}>
                        <Text style={styles.author}>By {article.authorUsername}</Text>
                        <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
                    </View>

                    {article.summary && (
                        <View style={styles.summaryContainer}>
                            <Text style={styles.summary}>{article.summary}</Text>
                        </View>
                    )}

                    <View style={styles.markdownContainer}>
                        <Markdown style={markdownStyles}>
                            {article.content}
                        </Markdown>
                    </View>

                    <View style={styles.statsContainer}>
                        <Text style={styles.stats}>{article.viewCount} views</Text>
                    </View>
                </View>
            </ScrollView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    featuredImage: {
        width: '100%',
        height: 200,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    category: {
        fontSize: 12,
        fontWeight: '500',
        color: '#ec4899',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 10,
        lineHeight: 28,
        letterSpacing: -0.3,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    author: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
        marginRight: 8,
    },
    date: {
        fontSize: 13,
        color: '#94a3b8',
    },
    summaryContainer: {
        backgroundColor: '#fafafa',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 6,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#ec4899',
    },
    summary: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    markdownContainer: {
        marginBottom: 20,
    },
    statsContainer: {
        paddingTop: 12,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    stats: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
