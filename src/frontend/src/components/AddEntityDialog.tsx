import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateEntity } from '../hooks/useEntities';
import { Loader2 } from 'lucide-react';

interface AddEntityDialogProps {
  entityType: 'student' | 'instructor' | 'aircraft' | 'exercise';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEntityDialog({ entityType, open, onOpenChange }: AddEntityDialogProps) {
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('');
  const [description, setDescription] = useState('');
  const createEntity = useCreateEntity(entityType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = crypto.randomUUID();
    
    try {
      if (entityType === 'student') {
        await createEntity.mutateAsync({ id, name });
      } else if (entityType === 'instructor') {
        await createEntity.mutateAsync({ id, name });
      } else if (entityType === 'aircraft') {
        await createEntity.mutateAsync({ id, registration });
      } else if (entityType === 'exercise') {
        await createEntity.mutateAsync({ id, name, description });
      }
      
      // Reset form
      setName('');
      setRegistration('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating entity:', error);
    }
  };

  const getTitle = () => {
    switch (entityType) {
      case 'student': return 'Add Student';
      case 'instructor': return 'Add Instructor';
      case 'aircraft': return 'Add Aircraft';
      case 'exercise': return 'Add Exercise';
    }
  };

  const getDescription = () => {
    switch (entityType) {
      case 'student': return 'Add a new student to the logbook.';
      case 'instructor': return 'Add a new instructor to the logbook.';
      case 'aircraft': return 'Add a new aircraft to the logbook.';
      case 'exercise': return 'Add a new exercise to the logbook.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {(entityType === 'student' || entityType === 'instructor' || entityType === 'exercise') && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Enter ${entityType} name`}
                  required
                />
              </div>
            )}
            {entityType === 'aircraft' && (
              <div className="space-y-2">
                <Label htmlFor="registration">Registration</Label>
                <Input
                  id="registration"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  placeholder="Enter aircraft registration"
                  required
                />
              </div>
            )}
            {entityType === 'exercise' && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter exercise description"
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEntity.isPending}>
              {createEntity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
