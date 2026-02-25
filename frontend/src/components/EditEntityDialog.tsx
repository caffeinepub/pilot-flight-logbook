import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useUpdateStudent,
  useUpdateInstructor,
  useUpdateAircraft,
  useUpdateExercise,
} from '../hooks/useEntities';
import type { Student, Instructor, Aircraft, Exercise } from '../backend';

type EntityType = 'student' | 'instructor' | 'aircraft' | 'exercise';
type EntityData = Student | Instructor | Aircraft | Exercise;

interface EditEntityDialogProps {
  entityType: EntityType;
  entity: EntityData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEntityDialog({
  entityType,
  entity,
  open,
  onOpenChange,
}: EditEntityDialogProps) {
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('');
  const [description, setDescription] = useState('');

  const updateStudent = useUpdateStudent();
  const updateInstructor = useUpdateInstructor();
  const updateAircraft = useUpdateAircraft();
  const updateExercise = useUpdateExercise();

  const isPending =
    updateStudent.isPending ||
    updateInstructor.isPending ||
    updateAircraft.isPending ||
    updateExercise.isPending;

  useEffect(() => {
    if (!entity) return;
    if (entityType === 'aircraft') {
      setRegistration((entity as Aircraft).registration);
    } else if (entityType === 'exercise') {
      setName((entity as Exercise).name);
      setDescription((entity as Exercise).description);
    } else {
      setName((entity as Student | Instructor).name);
    }
  }, [entity, entityType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity) return;

    try {
      if (entityType === 'student') {
        if (!name.trim()) { toast.error('Name is required'); return; }
        await updateStudent.mutateAsync({ id: entity.id, name: name.trim() });
        toast.success('Student updated successfully');
      } else if (entityType === 'instructor') {
        if (!name.trim()) { toast.error('Name is required'); return; }
        await updateInstructor.mutateAsync({ id: entity.id, name: name.trim() });
        toast.success('Instructor updated successfully');
      } else if (entityType === 'aircraft') {
        if (!registration.trim()) { toast.error('Registration is required'); return; }
        await updateAircraft.mutateAsync({ id: entity.id, registration: registration.trim() });
        toast.success('Aircraft updated successfully');
      } else if (entityType === 'exercise') {
        if (!name.trim()) { toast.error('Name is required'); return; }
        await updateExercise.mutateAsync({ id: entity.id, name: name.trim(), description: description.trim() });
        toast.success('Exercise updated successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || `Failed to update ${entityType}`);
    }
  };

  const titles: Record<EntityType, string> = {
    student: 'Edit Student',
    instructor: 'Edit Instructor',
    aircraft: 'Edit Aircraft',
    exercise: 'Edit Exercise',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titles[entityType]}</DialogTitle>
          <DialogDescription>Update the details for this {entityType}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {(entityType === 'student' || entityType === 'instructor' || entityType === 'exercise') && (
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Enter ${entityType} name`}
                  required
                />
              </div>
            )}
            {entityType === 'aircraft' && (
              <div className="space-y-2">
                <Label htmlFor="edit-registration">Registration</Label>
                <Input
                  id="edit-registration"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  placeholder="Enter aircraft registration"
                  required
                />
              </div>
            )}
            {entityType === 'exercise' && (
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
