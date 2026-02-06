import { ScrollView, Pressable, Text, View, StyleSheet } from "react-native";
import { CommunityCategory } from "../../types";

interface CategoryTabsProps {
  categories: CommunityCategory[];
  selectedCategory: CommunityCategory;
  onCategoryChange: (category: CommunityCategory) => void;
}

const CategoryTabs = ({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => onCategoryChange(category)}
              style={[
                styles.tab,
                isSelected ? styles.tabSelected : styles.tabUnselected
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected ? styles.tabTextSelected : styles.tabTextUnselected
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
    borderWidth: 1,
  },
  tabSelected: {
    backgroundColor: '#ec4899', // primary
    borderColor: '#ec4899',
  },
  tabUnselected: {
    backgroundColor: '#ffffff', // card
    borderColor: '#e2e8f0', // border
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextSelected: {
    color: '#ffffff',
  },
  tabTextUnselected: {
    color: '#0f172a', // foreground
  },
});

export default CategoryTabs;

