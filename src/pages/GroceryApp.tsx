import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AppNavigation } from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase, GroceryItem } from "@/lib/supabase";
import { toast } from "sonner";
import { ShoppingCart, Plus, Trash2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Frozen",
  "Pantry",
  "Beverages",
  "Snacks",
  "Other",
];

const GroceryApp = () => {
  const navigate = useNavigate();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"needed" | "inCart">("needed");

  // Form state
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Other");

  useEffect(() => {
    fetchGroceryItems();
  }, []);

  const fetchGroceryItems = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("grocery_items")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;
      setGroceryItems(data || []);
    } catch (error) {
      console.error("Error fetching grocery items:", error);
      toast.error("Failed to load grocery items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to add items");
        return;
      }

      if (!itemName.trim()) {
        toast.error("Please enter an item name");
        return;
      }

      const { error } = await supabase.from("grocery_items").insert({
        user_id: session.user.id,
        name: itemName,
        category: itemCategory,
        needed: true,
        inCart: false,
      });

      if (error) throw error;

      toast.success("Item added to grocery list!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchGroceryItems();
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast.error(error.message || "Failed to add item");
    }
  };

  const toggleItemStatus = async (item: GroceryItem) => {
    try {
      const newStatus = !item.inCart;
      const { error } = await supabase
        .from("grocery_items")
        .update({
          inCart: newStatus,
          needed: !newStatus
        })
        .eq("id", item.id);

      if (error) throw error;

      setGroceryItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, inCart: newStatus, needed: !newStatus } : i
        )
      );

      toast.success(newStatus ? "Added to cart" : "Moved to needed");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("grocery_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setGroceryItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Item deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const resetForm = () => {
    setItemName("");
    setItemCategory("Other");
  };

  const neededItems = groceryItems.filter((item) => item.needed);
  const inCartItems = groceryItems.filter((item) => item.inCart);

  const groupByCategory = (items: GroceryItem[]) => {
    const grouped: Record<string, GroceryItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const renderItemsList = (items: GroceryItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No items in this list</p>
        </div>
      );
    }

    const grouped = groupByCategory(items);
    const categories = Object.keys(grouped).sort();

    return (
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
              {category}
            </h3>
            <div className="space-y-2">
              {grouped[category].map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={item.inCart}
                          onCheckedChange={() => toggleItemStatus(item)}
                        />
                        <span
                          className={`text-base ${
                            item.inCart
                              ? "line-through text-gray-500 dark:text-gray-600"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-950 dark:to-emerald-950">
      <AppNavigation />
      <AppHeader title="Grocery List" icon={ShoppingCart} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Grocery List</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {groceryItems.length} item{groceryItems.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Grocery Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your grocery list
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name *</Label>
                  <Input
                    id="item-name"
                    placeholder="e.g., Milk, Eggs, Bread"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select value={itemCategory} onValueChange={setItemCategory}>
                    <SelectTrigger id="item-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs for Needed vs In Cart */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="needed">
              Needed ({neededItems.length})
            </TabsTrigger>
            <TabsTrigger value="inCart">
              In Cart ({inCartItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="needed" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : (
              renderItemsList(neededItems)
            )}
          </TabsContent>

          <TabsContent value="inCart" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : (
              renderItemsList(inCartItems)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroceryApp;
