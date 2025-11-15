import { useState } from 'react';
import { useGoalMapList } from '@/hooks/useGoalMapList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface GoalMapManagerProps {
  onMapSwitch?: (mapId: string) => void;
}

/**
 * Component for managing and switching between goal maps
 */
export function GoalMapManager({ onMapSwitch }: GoalMapManagerProps) {
  const {
    maps,
    activeMapId,
    activeMap,
    createMap,
    deleteMap,
    renameMap,
    switchToMap,
  } = useGoalMapList();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const handleCreateMap = () => {
    if (!newMapName.trim()) {
      toast.error('Please enter a map name');
      return;
    }

    const newMap = createMap(newMapName, true);
    console.log('[GoalMapManager] Created and switched to map:', newMap.id);
    toast.success(`Created map "${newMapName}"`);
    setNewMapName('');
    setIsCreateDialogOpen(false);

    if (onMapSwitch) {
      onMapSwitch(newMap.id);
    }
  };

  const handleSwitchMap = (mapId: string) => {
    if (mapId === activeMapId) return;

    switchToMap(mapId);
    const map = maps.find((m) => m.id === mapId);
    toast.success(`Switched to "${map?.name || 'Unknown'}"`);

    if (onMapSwitch) {
      onMapSwitch(mapId);
    }
  };

  const handleDeleteMap = () => {
    if (!activeMap || activeMap.id === 'default') {
      toast.error('Cannot delete the default map');
      return;
    }

    if (confirm(`Are you sure you want to delete "${activeMap.name}"? This cannot be undone.`)) {
      const success = deleteMap(activeMap.id);
      if (success) {
        toast.success(`Deleted map "${activeMap.name}"`);
        // Will auto-switch to default map
        if (onMapSwitch) {
          onMapSwitch('default');
        }
      }
    }
  };

  const handleRenameMap = () => {
    if (!renameValue.trim()) {
      toast.error('Please enter a new name');
      return;
    }

    if (!activeMap) return;

    renameMap(activeMap.id, renameValue);
    toast.success(`Renamed to "${renameValue}"`);
    setRenameValue('');
    setIsRenameDialogOpen(false);
  };

  const openRenameDialog = () => {
    if (activeMap) {
      setRenameValue(activeMap.name);
      setIsRenameDialogOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeMapId} onValueChange={handleSwitchMap}>
        <SelectTrigger className="w-48">
          <SelectValue>
            {activeMap?.name || 'Select a map'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {maps.map((map) => (
            <SelectItem key={map.id} value={map.id}>
              <div className="flex items-center justify-between gap-2">
                <span>{map.name}</span>
                {map.nodeCount > 0 && (
                  <span className="text-xs text-gray-500">
                    ({map.nodeCount})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Map</DialogTitle>
            <DialogDescription>
              Create a new goal map to organize different projects or goals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="map-name">Map Name</Label>
              <Input
                id="map-name"
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                placeholder="e.g., Work Goals, Personal Projects"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateMap();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMap}>
              <Plus className="w-4 h-4 mr-2" />
              Create Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" onClick={openRenameDialog}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Map</DialogTitle>
            <DialogDescription>
              Give your map a new name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rename-value">Map Name</Label>
              <Input
                id="rename-value"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameMap();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameMap}>
              <Edit2 className="w-4 h-4 mr-2" />
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeMap && activeMap.id !== 'default' && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDeleteMap}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
