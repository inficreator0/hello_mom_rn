import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import SearchBar from "../components/common/SearchBar";

interface Article {
  id: number;
  title: string;
  category: string;
  preview: string;
  image: string;
  readTime: string;
  alt?: string;
}

const CATEGORIES = [
  "All",
  "Pregnancy",
  "Postpartum",
  "Nutrition",
  "Mental Health",
  "Baby Care",
  "Breastfeeding",
  "Fitness & Recovery",
];

const mockArticles: Article[] = [
    {
      id: 1,
      title: "Understanding Your Body in the First Trimester",
      category: "Pregnancy",
      preview: "Learn about early pregnancy symptoms, hormonal changes, and important precautions.",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1609171676687-85dfc9d37fac?auto=format&fit=crop&w=1200&q=80",
      alt: "Pregnant woman gently holding her stomach in soft natural light"
    },
    {
      id: 2,
      title: "Postpartum Recovery: What No One Tells You",
      category: "Postpartum",
      preview: "A realistic guide to healing after childbirth—physically, mentally, and emotionally.",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1607968565043-36c0f7e0f92b?auto=format&fit=crop&w=1200&q=80",
      alt: "New mother resting on a couch holding her newborn baby"
    },
    {
      id: 3,
      title: "Foods That Boost Milk Supply",
      category: "Breastfeeding",
      preview: "Healthy, natural foods that can support breast milk production.",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
      alt: "Fresh fruits, nuts, and whole foods arranged on a table"
    },
    {
      id: 4,
      title: "Managing Stress & Anxiety During Motherhood",
      category: "Mental Health",
      preview: "Techniques for staying emotionally balanced during pregnancy and postpartum.",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1200&q=80",
      alt: "Woman sitting peacefully in a calm outdoor environment"
    },
    {
      id: 5,
      title: "Top Exercises for a Healthy Pregnancy",
      category: "Fitness & Recovery",
      preview: "Safe workouts recommended by doctors to stay active during pregnancy.",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07a?auto=format&fit=crop&w=1200&q=80",
      alt: "Pregnant woman doing light stretching indoors"
    },
    {
      id: 6,
      title: "Baby Sleep Essentials Every Mom Should Know",
      category: "Baby Care",
      preview: "Expert-backed tips for creating healthy sleep routines for newborns.",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1584595073828-df68e7f94c96?auto=format&fit=crop&w=1200&q=80",
      alt: "Sleeping newborn baby on a soft blanket"
    },
    {
      id: 7,
      title: "Prenatal Nutrition: What to Eat & Avoid",
      category: "Nutrition",
      preview: "A doctor-approved guide to maintaining a balanced pregnancy diet.",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1543352634-093a2f8688d6?auto=format&fit=crop&w=1200&q=80",
      alt: "Fresh vegetables and whole foods laid out on a kitchen counter"
    },
    {
      id: 8,
      title: "Bonding With Your Baby: The Science of Connection",
      category: "Baby Care",
      preview: "How early bonding shapes emotional and cognitive development.",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1526674183561-2e1dd9f81776?auto=format&fit=crop&w=1200&q=80",
      alt: "Mother holding her baby close in warm lighting"
    },
    {
      id: 9,
      title: "Pelvic Floor Care After Childbirth",
      category: "Recovery",
      preview: "Essential exercises and routines for pelvic strength post-delivery.",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1599058917503-4c6faf93cc06?auto=format&fit=crop&w=1200&q=80",
      alt: "Woman practicing gentle yoga on a mat"
    },
    {
      id: 10,
      title: "Understanding Mood Swings During Pregnancy",
      category: "Mental Health",
      preview: "Why mood changes happen and how to manage them with self-care.",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1529758146491-1e4e79fe1719?auto=format&fit=crop&w=1200&q=80",
      alt: "Woman sitting calmly by a window in soft morning light"
    },
    {
      id: 11,
      title: "Hydration Tips Every Mom Should Know",
      category: "Nutrition",
      preview: "How proper hydration affects pregnancy, postpartum, and breastfeeding.",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1514995428455-447d4443fa7f?auto=format&fit=crop&w=1200&q=80",
      alt: "Glass bottle of water with fresh lemons"
    },
    {
      id: 12,
      title: "Understanding Baby Milestones Month by Month",
      category: "Baby Care",
      preview: "A simple breakdown of developmental milestones you can expect.",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
      alt: "Baby lying on a soft mat holding a toy"
    }
  ];
  
  

export const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setArticles(mockArticles); // replace with your API later
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;

    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.preview.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <div className="container max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Helpful Articles
        </h1>

        <p className="text-muted-foreground text-sm mb-6">
          Learn more about your body, pregnancy, recovery, and your baby — from experts.
        </p>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            placeholder="Search articles..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted text-muted-foreground border-muted hover:border-primary/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {filteredArticles.map((article) => (
          <Card
            key={article.id}
            className="overflow-hidden bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition border border-border/60"
          >
            {/* Thumbnail */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-40 object-cover"
            />

            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-1">{article.title}</h3>

              <p className="text-xs text-muted-foreground mb-2">
                {article.category} • {article.readTime}
              </p>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {article.preview}
              </p>

              <Button variant="secondary" className="w-full">
                Read More
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

        {filteredArticles.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">
            No articles found.
          </p>
        )}
      </div>
    </div>
  );
};

