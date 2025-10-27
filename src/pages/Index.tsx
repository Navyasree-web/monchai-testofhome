import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import CuisineSection from "@/components/CuisineSection";
import MenuGrid from "@/components/MenuGrid";
import { MoodFoodSuggester } from "@/components/MoodFoodSuggester";
import Footer from "@/components/Footer";
import FloatingCartBar from "@/components/FloatingCartBar";

const Index = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch item counts for each category
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['category-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('category_id')
        .eq('is_available', true);
      
      if (error) throw error;
      
      // Count items per category
      const counts: Record<string, number> = {};
      data.forEach(item => {
        if (item.category_id) {
          counts[item.category_id] = (counts[item.category_id] || 0) + 1;
        }
      });
      
      return counts;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 py-8">
          <HeroCarousel />

          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Browse by Category</h2>
              <p className="text-muted-foreground text-lg">
                Discover your favorite dishes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  title={category.name}
                  image={category.image_url || '/placeholder.svg'}
                  itemCount={categoryCounts[category.id] || 0}
                />
              ))}
            </div>
          </section>

          <CuisineSection />

          <MoodFoodSuggester />

          <MenuGrid />
        </div>
      </main>

      <Footer />
      <FloatingCartBar />
    </div>
  );
};

export default Index;
