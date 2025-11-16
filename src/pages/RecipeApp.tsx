import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AppNavigation } from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, Recipe } from "@/lib/supabase";
import { toast } from "sonner";
import { ChefHat, Plus, Heart, Clock, Users, Star, Filter, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RecipeApp = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ready">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Form state
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("4");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");

  useEffect(() => {
    fetchRecipes();
    fetchFavorites();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("recipe_id")
        .eq("user_id", session.user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map((f) => f.recipe_id) || []));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleAddRecipe = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to add recipes");
        return;
      }

      if (!recipeName.trim() || !ingredients.trim()) {
        toast.error("Please fill in recipe name and ingredients");
        return;
      }

      const ingredientArray = ingredients
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const { error } = await supabase.from("recipes").insert({
        user_id: session.user.id,
        recipe_name: recipeName,
        title: recipeName,
        ingredients: ingredientArray,
        instructions: instructions || "",
        cookTime: cookTime || null,
        servings: parseInt(servings) || 4,
        difficulty,
        totalIngredients: ingredientArray.length,
        availableIngredients: 0,
        rating: 0,
      });

      if (error) throw error;

      toast.success("Recipe added successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchRecipes();
    } catch (error: any) {
      console.error("Error adding recipe:", error);
      toast.error(error.message || "Failed to add recipe");
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (favorites.has(recipeId)) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", session.user.id)
          .eq("recipe_id", recipeId);

        if (error) throw error;
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(recipeId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: session.user.id, recipe_id: recipeId });

        if (error) throw error;
        setFavorites((prev) => new Set(prev).add(recipeId));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const resetForm = () => {
    setRecipeName("");
    setIngredients("");
    setInstructions("");
    setCookTime("");
    setServings("4");
    setDifficulty("Easy");
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (filter === "ready") {
      return (
        recipe.availableIngredients !== undefined &&
        recipe.totalIngredients !== undefined &&
        recipe.availableIngredients >= recipe.totalIngredients
      );
    }
    return true;
  });

  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-orange-950 dark:to-amber-950">
      <AppNavigation />
      <AppHeader title="Recipe Manager" icon={ChefHat} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Recipes</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Recipe</DialogTitle>
                <DialogDescription>
                  Enter the details for your new recipe
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-name">Recipe Name *</Label>
                  <Input
                    id="recipe-name"
                    placeholder="e.g., Spaghetti Carbonara"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients (one per line) *</Label>
                  <Textarea
                    id="ingredients"
                    placeholder="e.g.,&#10;2 eggs&#10;200g spaghetti&#10;100g bacon&#10;50g parmesan cheese"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter cooking instructions..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cook-time">Cook Time</Label>
                    <Input
                      id="cook-time"
                      placeholder="e.g., 30 min"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRecipe}>Add Recipe</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Recipes</TabsTrigger>
            <TabsTrigger value="ready">Ready to Cook</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No recipes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first recipe!
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{recipe.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(recipe.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                  </div>
                  {recipe.difficulty && (
                    <Badge className={difficultyColors[recipe.difficulty]}>
                      {recipe.difficulty}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {recipe.cookTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cookTime}</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Ingredients: {recipe.totalIngredients || recipe.ingredients?.length || 0}
                    </p>
                  </div>

                  {recipe.rating && recipe.rating > 0 && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < recipe.rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                <div className="flex gap-2 mt-2">
                  {selectedRecipe.difficulty && (
                    <Badge className={difficultyColors[selectedRecipe.difficulty]}>
                      {selectedRecipe.difficulty}
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Meta info */}
                <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                  {selectedRecipe.cookTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedRecipe.cookTime}</span>
                    </div>
                  )}
                  {selectedRecipe.servings && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{selectedRecipe.servings} servings</span>
                    </div>
                  )}
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRecipe.ingredients?.map((ingredient, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                {selectedRecipe.instructions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedRecipe.instructions}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeApp;
