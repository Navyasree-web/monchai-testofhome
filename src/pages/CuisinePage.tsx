import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CuisinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data: cuisine } = useQuery({
    queryKey: ['cuisine', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cuisines')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: foodItems = [] } = useQuery({
    queryKey: ['food-items', 'cuisine', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('*, category:categories(name), cuisine:cuisines(name)')
        .eq('cuisine_id', id)
        .eq('is_available', true);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{cuisine?.name}</h1>
            <p className="text-muted-foreground text-lg">{cuisine?.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foodItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/food/${item.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    {item.category?.name && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        {item.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">4.5</span>
                      <span className="text-sm text-muted-foreground">(120+)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ₹{item.price}
                      </span>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: Number(item.price),
                            image_url: item.image_url || '/placeholder.svg',
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {foodItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items available for this cuisine yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CuisinePage;
