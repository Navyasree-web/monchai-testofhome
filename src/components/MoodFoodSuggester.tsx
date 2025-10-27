import { useState } from "react";
import { Button } from "./ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MoodFoodSuggester = () => {
  const [mood, setMood] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!mood.trim()) {
      toast({
        title: "Please enter your mood",
        description: "Tell us how you're feeling to get personalized suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestion("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-food`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mood: mood.trim() }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get suggestion");
      }

      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "Failed to get suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moodPresets = ["Happy", "Stressed", "Tired", "Adventurous", "Comfort-seeking"];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              What Should I Eat?
            </h2>
          </div>
          <p className="text-muted-foreground">
            Tell us your mood, and our AI will suggest the perfect dish for you
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              How are you feeling?
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSuggest()}
              placeholder="e.g., happy, stressed, hungry..."
              className="w-full px-4 py-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {moodPresets.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => setMood(preset)}
                disabled={isLoading}
              >
                {preset}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSuggest}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting suggestions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Suggest Food
              </>
            )}
          </Button>

          {suggestion && (
            <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-accent animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Perfect for your mood:
              </h3>
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {suggestion}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
