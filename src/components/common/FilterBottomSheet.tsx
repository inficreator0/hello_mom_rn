import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetOverlay } from "../ui/bottom-sheet";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Check } from "lucide-react-native";

interface FilterBottomSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedSort: "recent" | "upvotes";
    onSortChange: (sort: "recent" | "upvotes") => void;
    onApply: () => void;
}

export const FilterBottomSheet = ({
    open,
    onOpenChange,
    categories,
    selectedCategory,
    onCategoryChange,
    selectedSort,
    onSortChange,
    onApply,
}: FilterBottomSheetProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent style={styles.content}>
                <SheetHeader style={styles.header}>
                    <SheetTitle>Filters & Sort</SheetTitle>
                </SheetHeader>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Sorting Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sort By</Text>
                        <View style={styles.sortOptions}>
                            <Pressable
                                style={[
                                    styles.sortOption,
                                    selectedSort === "recent" ? styles.sortOptionSelected : styles.sortOptionUnselected
                                ]}
                                onPress={() => onSortChange("recent")}
                            >
                                <Text style={[
                                    styles.sortText,
                                    selectedSort === "recent" ? styles.sortTextSelected : styles.sortTextUnselected
                                ]}>Newest</Text>
                                {selectedSort === "recent" && <Check size={16} color="#ec4899" />}
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.sortOption,
                                    selectedSort === "upvotes" ? styles.sortOptionSelected : styles.sortOptionUnselected
                                ]}
                                onPress={() => onSortChange("upvotes")}
                            >
                                <Text style={[
                                    styles.sortText,
                                    selectedSort === "upvotes" ? styles.sortTextSelected : styles.sortTextUnselected
                                ]}>Top Voted</Text>
                                {selectedSort === "upvotes" && <Check size={16} color="#ec4899" />}
                            </Pressable>
                        </View>
                    </View>

                    {/* Categories Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Category</Text>
                        <View style={styles.categoriesGrid}>
                            {categories.map((category) => (
                                <Pressable
                                    key={category}
                                    onPress={() => onCategoryChange(category)}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === category ? styles.categoryChipSelected : styles.categoryChipUnselected
                                    ]}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategory === category ? styles.categoryTextSelected : styles.categoryTextUnselected
                                    ]}>{category}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button onPress={onApply} style={styles.applyButton}>
                        Apply Filters
                    </Button>
                </View>
            </SheetContent>
        </Sheet>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 0,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    sortOptions: {
        gap: 12,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    sortOptionSelected: {
        backgroundColor: 'rgba(236, 72, 153, 0.05)', // primary/5
        borderColor: '#ec4899', // primary
    },
    sortOptionUnselected: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0', // border
    },
    sortText: {
        fontSize: 14,
        fontWeight: '500',
    },
    sortTextSelected: {
        color: '#ec4899', // primary
    },
    sortTextUnselected: {
        color: '#0f172a',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryChipSelected: {
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
    },
    categoryChipUnselected: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: '#ffffff',
    },
    categoryTextUnselected: {
        color: '#64748b',
    },
    footer: {
        padding: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#ffffff',
    },
    applyButton: {
        width: '100%',
    },
});
