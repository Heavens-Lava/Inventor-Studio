import { memo, useState, useCallback } from 'react';
import { useTemplateStorage } from '@/hooks/useTemplateStorage';
import { TemplateCategory } from '@/types/template';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Briefcase, Dumbbell, BookOpen, Rocket, Star, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons = {
  career: Briefcase,
  fitness: Dumbbell,
  learning: BookOpen,
  business: Rocket,
  custom: Star,
};

const categoryColors = {
  career: 'bg-purple-100 text-purple-700 border-purple-300',
  fitness: 'bg-green-100 text-green-700 border-green-300',
  learning: 'bg-blue-100 text-blue-700 border-blue-300',
  business: 'bg-orange-100 text-orange-700 border-orange-300',
  custom: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

interface TemplateBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (templateId: string) => void;
}

export const TemplateBrowser = memo(({ open, onOpenChange, onApplyTemplate }: TemplateBrowserProps) => {
  const { getAllTemplates, deleteTemplate } = useTemplateStorage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const templates = getAllTemplates();

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  const handleApplyTemplate = useCallback((templateId: string) => {
    onApplyTemplate(templateId);
    onOpenChange(false);
  }, [onApplyTemplate, onOpenChange]);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    if (deleteTemplate(templateId)) {
      setTemplateToDelete(null);
    }
  }, [deleteTemplate]);

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    { value: 'career', label: 'Career', count: templates.filter((t) => t.category === 'career').length },
    { value: 'fitness', label: 'Fitness', count: templates.filter((t) => t.category === 'fitness').length },
    { value: 'learning', label: 'Learning', count: templates.filter((t) => t.category === 'learning').length },
    { value: 'business', label: 'Business', count: templates.filter((t) => t.category === 'business').length },
    { value: 'custom', label: 'Custom', count: templates.filter((t) => t.category === 'custom').length },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Template Browser</DialogTitle>
            <DialogDescription>
              Choose a template to get started quickly or browse your saved custom templates
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid grid-cols-6 w-full">
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                  {cat.label}
                  {cat.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {cat.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No templates found in this category</p>
                  {selectedCategory === 'custom' && (
                    <p className="text-sm text-gray-400 mt-2">
                      Save your current canvas as a template to see it here
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => {
                    const CategoryIcon = categoryIcons[template.category as TemplateCategory];
                    const colorClass = categoryColors[template.category as TemplateCategory];

                    return (
                      <div
                        key={template.id}
                        className={`
                          border-2 rounded-lg p-4 transition-all hover:shadow-lg
                          ${colorClass}
                        `}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-5 h-5" />
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {template.category}
                          </Badge>
                        </div>

                        <p className="text-sm mb-4 line-clamp-2">{template.description}</p>

                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {template.isCustom
                              ? `Created ${format(new Date(template.createdAt), 'MMM d, yyyy')}`
                              : 'Pre-made template'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApplyTemplate(template.id)}
                            className="flex-1"
                            size="sm"
                          >
                            Use Template
                          </Button>
                          {template.isCustom && (
                            <Button
                              onClick={() => setTemplateToDelete(template.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

TemplateBrowser.displayName = 'TemplateBrowser';
