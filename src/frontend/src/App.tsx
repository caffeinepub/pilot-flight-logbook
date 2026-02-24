import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Plane } from 'lucide-react';
import FlightLogForm from './components/FlightLogForm';
import FlightLogTable from './components/FlightLogTable';
import StudentReport from './components/StudentReport';
import InstructorReport from './components/InstructorReport';
import ExportButton from './components/ExportButton';
import AddEntityDialog from './components/AddEntityDialog';
import type { FlightLog } from './backend';

export default function App() {
  const [editingFlightLog, setEditingFlightLog] = useState<FlightLog | null>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showInstructorDialog, setShowInstructorDialog] = useState(false);
  const [showAircraftDialog, setShowAircraftDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Pilot Flight Logbook</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={() => setShowStudentDialog(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <Button onClick={() => setShowInstructorDialog(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Instructor
          </Button>
          <Button onClick={() => setShowAircraftDialog(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Aircraft
          </Button>
          <Button onClick={() => setShowExerciseDialog(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Exercise
          </Button>
        </div>

        <Tabs defaultValue="entry" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="entry">Flight Entry</TabsTrigger>
            <TabsTrigger value="logs">Flight Logs</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="mt-6">
            <div className="mx-auto max-w-3xl">
              <FlightLogForm
                flightLog={editingFlightLog}
                onSuccess={() => setEditingFlightLog(null)}
                onCancel={() => setEditingFlightLog(null)}
              />
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <FlightLogTable onEdit={(log) => {
              setEditingFlightLog(log);
              // Scroll to top to show the form
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <StudentReport />
              <InstructorReport />
            </div>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <h2 className="mb-4 text-2xl font-semibold">Export Flight Logs</h2>
                <p className="mb-6 text-muted-foreground">
                  Download all flight log data as a CSV file for use in spreadsheet applications.
                </p>
                <ExportButton />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-16 border-t border-border bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Pilot Flight Logbook. Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      <AddEntityDialog
        entityType="student"
        open={showStudentDialog}
        onOpenChange={setShowStudentDialog}
      />
      <AddEntityDialog
        entityType="instructor"
        open={showInstructorDialog}
        onOpenChange={setShowInstructorDialog}
      />
      <AddEntityDialog
        entityType="aircraft"
        open={showAircraftDialog}
        onOpenChange={setShowAircraftDialog}
      />
      <AddEntityDialog
        entityType="exercise"
        open={showExerciseDialog}
        onOpenChange={setShowExerciseDialog}
      />
    </div>
  );
}
