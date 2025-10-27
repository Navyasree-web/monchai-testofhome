import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  id: string;
  title: string;
  image: string;
  itemCount: number;
}

const CategoryCard = ({ id, title, image, itemCount }: CategoryCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/category/${id}`)}
    >
      <CardContent className="p-0">
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-white/90 mb-3">{itemCount} items</p>
            <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
              Explore <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
