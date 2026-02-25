import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Pencil, Trash2, Users, UserCheck, Plane, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  useEntities,
  useDeleteStudent,
  useDeleteInstructor,
  useDeleteAircraft,
  useDeleteExercise,
} from '../hooks/useEntities';
import AddEntityDialog from './AddEntityDialog';
import EditEntityDialog from './EditEntityDialog';
import type { Student, Instructor, Aircraft, Exercise } from '../backend';

type EntityType = 'student' | 'instructor' | 'aircraft' | 'exercise';
type EntityData = Student | Instructor | Aircraft | Exercise;

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={99} className="py-10 text-center text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  );
}

interface DeleteConfirmProps {
  open: boolean;
  entityType: EntityType;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function DeleteConfirmDialog({ open, entityType, onConfirm, onCancel, isPending }: DeleteConfirmProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {entityType}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Students Panel ───────────────────────────────────────────────────────────
function StudentsPanel() {
  const { students } = useEntities();
  const deleteStudent = useDeleteStudent();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudent.mutateAsync(deleteTarget.id);
      toast.success('Student deleted successfully');
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Students</h3>
          {students.data && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {students.data.length}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.isLoading ? (
              <TableSkeleton cols={3} />
            ) : !students.data?.length ? (
              <EmptyRow message="No students found. Add one to get started." />
            ) : (
              students.data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(s)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(s)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddEntityDialog entityType="student" open={showAdd} onOpenChange={setShowAdd} />
      <EditEntityDialog
        entityType="student"
        entity={editTarget}
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null); }}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        entityType="student"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteStudent.isPending}
      />
    </div>
  );
}

// ─── Instructors Panel ────────────────────────────────────────────────────────
function InstructorsPanel() {
  const { instructors } = useEntities();
  const deleteInstructor = useDeleteInstructor();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Instructor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Instructor | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInstructor.mutateAsync(deleteTarget.id);
      toast.success('Instructor deleted successfully');
    } catch {
      toast.error('Failed to delete instructor');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Instructors</h3>
          {instructors.data && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {instructors.data.length}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Instructor
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.isLoading ? (
              <TableSkeleton cols={3} />
            ) : !instructors.data?.length ? (
              <EmptyRow message="No instructors found. Add one to get started." />
            ) : (
              instructors.data.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{inst.id}</TableCell>
                  <TableCell className="font-medium">{inst.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(inst)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(inst)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddEntityDialog entityType="instructor" open={showAdd} onOpenChange={setShowAdd} />
      <EditEntityDialog
        entityType="instructor"
        entity={editTarget}
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null); }}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        entityType="instructor"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteInstructor.isPending}
      />
    </div>
  );
}

// ─── Aircraft Panel ───────────────────────────────────────────────────────────
function AircraftPanel() {
  const { aircraft } = useEntities();
  const deleteAircraft = useDeleteAircraft();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Aircraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Aircraft | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAircraft.mutateAsync(deleteTarget.id);
      toast.success('Aircraft deleted successfully');
    } catch {
      toast.error('Failed to delete aircraft');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Aircraft</h3>
          {aircraft.data && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {aircraft.data.length}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Aircraft
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aircraft.isLoading ? (
              <TableSkeleton cols={3} />
            ) : !aircraft.data?.length ? (
              <EmptyRow message="No aircraft found. Add one to get started." />
            ) : (
              aircraft.data.map((ac) => (
                <TableRow key={ac.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{ac.id}</TableCell>
                  <TableCell className="font-medium">{ac.registration}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(ac)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(ac)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddEntityDialog entityType="aircraft" open={showAdd} onOpenChange={setShowAdd} />
      <EditEntityDialog
        entityType="aircraft"
        entity={editTarget}
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null); }}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        entityType="aircraft"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteAircraft.isPending}
      />
    </div>
  );
}

// ─── Exercises Panel ──────────────────────────────────────────────────────────
function ExercisesPanel() {
  const { exercises } = useEntities();
  const deleteExercise = useDeleteExercise();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExercise.mutateAsync(deleteTarget.id);
      toast.success('Exercise deleted successfully');
    } catch {
      toast.error('Failed to delete exercise');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Exercises</h3>
          {exercises.data && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {exercises.data.length}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.isLoading ? (
              <TableSkeleton cols={4} />
            ) : !exercises.data?.length ? (
              <EmptyRow message="No exercises found. Add one to get started." />
            ) : (
              exercises.data.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{ex.id}</TableCell>
                  <TableCell className="font-medium">{ex.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{ex.description || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(ex)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(ex)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddEntityDialog entityType="exercise" open={showAdd} onOpenChange={setShowAdd} />
      <EditEntityDialog
        entityType="exercise"
        entity={editTarget}
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null); }}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        entityType="exercise"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteExercise.isPending}
      />
    </div>
  );
}

// ─── Main EntityManagement Component ─────────────────────────────────────────
export default function EntityManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Manage Entities</h2>
        <p className="mt-1 text-muted-foreground">
          Add, edit, or remove students, instructors, aircraft, and exercises used in flight logs.
        </p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="students">
            <Users className="mr-1.5 h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="instructors">
            <UserCheck className="mr-1.5 h-4 w-4" />
            Instructors
          </TabsTrigger>
          <TabsTrigger value="aircraft">
            <Plane className="mr-1.5 h-4 w-4" />
            Aircraft
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <BookOpen className="mr-1.5 h-4 w-4" />
            Exercises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <StudentsPanel />
        </TabsContent>
        <TabsContent value="instructors" className="mt-6">
          <InstructorsPanel />
        </TabsContent>
        <TabsContent value="aircraft" className="mt-6">
          <AircraftPanel />
        </TabsContent>
        <TabsContent value="exercises" className="mt-6">
          <ExercisesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
