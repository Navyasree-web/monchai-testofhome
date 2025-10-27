import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingCartBar = () => {
  const { totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 shadow-lg z-50 animate-slide-up">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-6 w-6" />
          <div>
            <p className="font-semibold">{totalItems} item{totalItems !== 1 ? 's' : ''} added</p>
            <p className="text-sm opacity-90">₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/cart')}
          className="font-semibold"
        >
          View Cart & Checkout
        </Button>
      </div>
    </div>
  );
};

export default FloatingCartBar;
