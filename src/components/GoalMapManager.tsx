import { memo, useState, useCallback } from 'react';
import { useGoalMapList } from '@/hooks/useGoalMapList';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Trash2, Edit, Map, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface GoalMapManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoalMapManager = memo(({ open, onOpenChange }: GoalMapManagerProps) => {
  const { maps, activeMapId, deleteMap, renameMap, setActiveMap } = useGoalMapList();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const [editMapName, setEditMapName] = useState('');
  const [editMapDescription, setEditMapDescription] = useState('');

  const handleEditMap = useCallback(() => {
    if (!selectedMapId || !editMapName.trim()) {
      toast.error('Please enter a map name');
      return;
    }

    renameMap(selectedMapId, editMapName.trim(), editMapDescription.trim());
    toast.success('Map updated');
    setIsEditDialogOpen(false);
    setSelectedMapId(null);
    setEditMapName('');
    setEditMapDescription('');
  }, [selectedMapId, editMapName, editMapDescription, renameMap]);

  const handleDeleteMap = useCallback(() => {
    if (!selectedMapId) return;

    const success = deleteMap(selectedMapId);
    if (success) {
      toast.success('Map deleted');
    } else {
      toast.error('Cannot delete the last map');
    }

    setIsDeleteDialogOpen(false);
    setSelectedMapId(null);
  }, [selectedMapId, deleteMap]);

  const handleSelectMap = useCallback((mapId: string) => {
    setActiveMap(mapId);
    toast.success('Switched map');
    onOpenChange(false);
  }, [setActiveMap, onOpenChange]);

  const openEditDialog = useCallback((mapId: string, mapName: string, mapDescription?: string) => {
    setSelectedMapId(mapId);
    setEditMapName(mapName);
    setEditMapDescription(mapDescription || '');
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((mapId: string) => {
    setSelectedMapId(mapId);
    setIsDeleteDialogOpen(true);
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Map className="w-6 h-6" />
              Goal Maps
            </DialogTitle>
            <DialogDescription>
              Manage your goal maps. Switch between maps or organize your existing maps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Maps List */}
            <div className="space-y-2">
              {maps.map((map) => (
                <Card
                  key={map.id}
                  className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                    map.id === activeMapId ? 'border-2 border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => map.id !== activeMapId && handleSelectMap(map.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{map.name}</h3>
                        {map.id === activeMapId && (
                          <Badge variant="default" className="bg-blue-600">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>

                      {map.description && (
                        <p className="text-sm text-gray-600 mb-2">{map.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{map.nodeCount} cards</span>
                        <span>•</span>
                        <span>Updated {format(new Date(map.lastModified), 'MMM d, yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(map.id, map.name, map.description)}
                        title="Rename map"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(map.id)}
                        disabled={maps.length === 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete map"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Map Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal Map</DialogTitle>
            <DialogDescription>
              Update the name and description of your goal map
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Map Name *</Label>
              <Input
                value={editMapName}
                onChange={(e) => setEditMapName(e.target.value)}
                placeholder="Map name"
                onKeyDown={(e) => e.key === 'Enter' && handleEditMap()}
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={editMapDescription}
                onChange={(e) => setEditMapDescription(e.target.value)}
                placeholder="What is this map for?"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEditMap} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedMapId(null);
                  setEditMapName('');
                  setEditMapDescription('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal Map</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal map? All cards and connections will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMapId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMap}
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

GoalMapManager.displayName = 'GoalMapManager';
