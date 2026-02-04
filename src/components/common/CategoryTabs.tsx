import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { CommunityCategory } from "../../types";

interface CategoryTabsProps {
  categories: CommunityCategory[];
  selectedCategory: CommunityCategory;
  onCategoryChange: (category: CommunityCategory) => void;
}

const CategoryTabs = ({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <Tabs value={selectedCategory} onValueChange={(value) => onCategoryChange(value as CommunityCategory)}>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-8">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs md:text-sm whitespace-nowrap">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
};

export default CategoryTabs;

