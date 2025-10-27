import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const colors = ["bg-orange-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-indigo-500"];

const CuisineSection = () => {
  const navigate = useNavigate();

  const { data: cuisines = [], isLoading } = useQuery({
    queryKey: ['cuisines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cuisines')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="text-center">
          <p className="text-muted-foreground">Loading cuisines...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Explore by Cuisine</h2>
        <p className="text-muted-foreground text-lg">
          Authentic flavors from across the regions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cuisines.map((cuisine, index) => (
          <Button
            key={cuisine.id}
            variant="outline"
            className="h-auto flex flex-col items-start p-6 hover:shadow-lg transition-all group"
            onClick={() => navigate(`/cuisine/${cuisine.id}`)}
          >
            {cuisine.image_url ? (
              <img 
                src={cuisine.image_url} 
                alt={cuisine.name}
                className="w-12 h-12 rounded-full object-cover mb-4 group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full ${colors[index % colors.length]} mb-4 group-hover:scale-110 transition-transform`} />
            )}
            <h3 className="font-semibold text-lg mb-1">{cuisine.name}</h3>
            <Badge variant="secondary" className="mt-2">
              View dishes
            </Badge>
          </Button>
        ))}
      </div>
    </section>
  );
};

export default CuisineSection;
