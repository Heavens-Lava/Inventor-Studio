import { memo, useState, useCallback } from 'react';
import { useTemplateStorage } from '@/hooks/useTemplateStorage';
import { TemplateCategory } from '@/types/template';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Dumbbell, BookOpen, Rocket, Star, ChevronLeft, ChevronRight, Target, Sparkles } from 'lucide-react';

const categoryIcons = {
  career: Briefcase,
  fitness: Dumbbell,
  learning: BookOpen,
  business: Rocket,
  custom: Star,
};

const categoryColors = {
  career: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200',
  fitness: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
  learning: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
  business: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
  custom: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
};

interface QuickStartWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (templateId: string | null, customization?: { title?: string; description?: string }) => void;
}

export const QuickStartWizard = memo(({ open, onOpenChange, onApplyTemplate }: QuickStartWizardProps) => {
  const { getAllTemplates } = useTemplateStorage();
  const [step, setStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const templates = getAllTemplates();

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSelectTemplate = useCallback((templateId: string | null) => {
    setSelectedTemplateId(templateId);
    handleNext();
  }, [handleNext]);

  const handleFinish = useCallback(() => {
    const customization = customTitle || customDescription
      ? { title: customTitle, description: customDescription }
      : undefined;

    onApplyTemplate(selectedTemplateId, customization);
    onOpenChange(false);

    // Reset wizard
    setStep(0);
    setSelectedTemplateId(null);
    setCustomTitle('');
    setCustomDescription('');
  }, [selectedTemplateId, customTitle, customDescription, onApplyTemplate, onOpenChange]);

  const selectedTemplate = selectedTemplateId
    ? templates.find((t) => t.id === selectedTemplateId)
    : null;

  const renderStep = () => {
    switch (step) {
      case 0:
        // Welcome Step
        return (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Goal Maps!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Visualize your goals, milestones, and requirements in an interactive canvas.
                Connect related items, track progress, and achieve your dreams.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                What you can do:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                <li>Create goals, milestones, requirements, and notes</li>
                <li>Connect items to show relationships and dependencies</li>
                <li>Track progress with animated progress bars</li>
                <li>Organize with colors, emojis, and tags</li>
                <li>Edit everything inline with double-click</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleNext} size="lg">
                Get Started
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 1:
        // Template Selection Step
        return (
          <div className="space-y-6 py-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Choose Your Starting Point</h2>
              <p className="text-gray-600">
                Select a pre-made template or start with a blank canvas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Blank Canvas Option */}
              <button
                onClick={() => handleSelectTemplate(null)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold">Blank Canvas</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Start from scratch and build your own custom goal map
                </p>
              </button>

              {/* Template Options */}
              {templates.filter((t) => !t.isCustom).map((template) => {
                const CategoryIcon = categoryIcons[template.category as TemplateCategory];
                const colorClass = categoryColors[template.category as TemplateCategory];

                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`border-2 rounded-lg p-4 text-left transition-all ${colorClass}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold">{template.name}</h3>
                    </div>
                    <p className="text-sm line-clamp-2">{template.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        // Customization Step
        return (
          <div className="space-y-6 py-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Customize Your Goal Map</h2>
              <p className="text-gray-600">
                {selectedTemplate
                  ? `Personalize the "${selectedTemplate.name}" template (optional)`
                  : 'Give your goal map a name and description (optional)'}
              </p>
            </div>

            {selectedTemplate && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const Icon = categoryIcons[selectedTemplate.category as TemplateCategory];
                    return <Icon className="w-4 h-4" />;
                  })()}
                  <h3 className="font-semibold">{selectedTemplate.name}</h3>
                  <Badge variant="outline" className="capitalize">
                    {selectedTemplate.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-title">Custom Title (Optional)</Label>
                <Input
                  id="custom-title"
                  placeholder={selectedTemplate ? `e.g., My ${selectedTemplate.name}` : 'My Goal Map'}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-description">Custom Description (Optional)</Label>
                <Textarea
                  id="custom-description"
                  placeholder="Add a personal description..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        // Confirmation Step
        return (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your goal map is ready to be created. Click finish to start working on your goals.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-blue-900">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[20px]">1.</span>
                  <span>Double-click any card to edit its content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[20px]">2.</span>
                  <span>Drag from connection points to create relationships</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[20px]">3.</span>
                  <span>Use the toolbar to add new cards and customize your map</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[20px]">4.</span>
                  <span>Press "?" to view all keyboard shortcuts</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleFinish} className="flex-1 bg-green-600 hover:bg-green-700">
                Finish & Create Map
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Quick Start Wizard</DialogTitle>
            <Badge variant="outline">
              Step {step + 1} of 4
            </Badge>
          </div>
          <DialogDescription>
            Let's set up your first goal map together
          </DialogDescription>
        </DialogHeader>

        {renderStep()}

        {/* Progress Indicators */}
        <div className="flex gap-2 justify-center pt-4 border-t">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? 'w-8 bg-blue-600'
                  : i < step
                  ? 'w-2 bg-blue-400'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});

QuickStartWizard.displayName = 'QuickStartWizard';
