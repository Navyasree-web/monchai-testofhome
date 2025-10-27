import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: foodItem, isLoading } = useQuery({
    queryKey: ['food-item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('*, category:categories(name), cuisine:cuisines(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const cartItem = items.find(item => item.id === id);

  const handleAddToCart = () => {
    if (foodItem) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: foodItem.id,
          name: foodItem.name,
          price: Number(foodItem.price),
          image_url: foodItem.image_url || '/placeholder.svg',
        });
      }
      setQuantity(1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!foodItem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-lg mb-4">Food item not found</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative rounded-lg overflow-hidden shadow-xl h-[400px] md:h-[500px]">
              <img
                src={foodItem.image_url || '/placeholder.svg'}
                alt={foodItem.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex gap-2 mb-3">
                  {foodItem.category?.name && (
                    <Badge variant="secondary">{foodItem.category.name}</Badge>
                  )}
                  {foodItem.cuisine?.name && (
                    <Badge className="bg-accent text-accent-foreground">{foodItem.cuisine.name}</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-3">{foodItem.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <span className="font-medium">4.5</span>
                  </div>
                  <span className="text-muted-foreground">(120+ ratings)</span>
                </div>
                <p className="text-muted-foreground text-lg">{foodItem.description}</p>
              </div>

              {foodItem.ingredients && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ingredients</h3>
                  <p className="text-muted-foreground">{foodItem.ingredients}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-primary">
                    ₹{Number(foodItem.price).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add to Cart - ₹{(Number(foodItem.price) * quantity).toFixed(2)}
                </Button>

                {cartItem && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    {cartItem.quantity} already in cart
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FoodDetailPage;
