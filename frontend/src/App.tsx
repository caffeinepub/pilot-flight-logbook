import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Shield } from 'lucide-react';
import FlightLogForm from './components/FlightLogForm';
import FlightLogTable from './components/FlightLogTable';
import StudentReport from './components/StudentReport';
import InstructorReport from './components/InstructorReport';
import ExportButton from './components/ExportButton';
import EntityManagement from './components/EntityManagement';
import AdminPanel from './components/AdminPanel';
import { Toaster } from '@/components/ui/sonner';
import { useIsAdmin } from './hooks/useAdminPanel';
import type { FlightLog } from './backend';

export default function App() {
  const [activeTab, setActiveTab] = useState('entry');
  const [editingFlightLog, setEditingFlightLog] = useState<FlightLog | null>(null);
  const { isAdmin } = useIsAdmin();

  const handleEdit = (log: FlightLog) => {
    setEditingFlightLog(log);
    setActiveTab('entry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const gridCols = isAdmin ? 'grid-cols-6' : 'grid-cols-5';

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`mb-6 grid w-full ${gridCols} lg:w-auto lg:inline-grid`}>
            <TabsTrigger value="entry">Flight Entry</TabsTrigger>
            <TabsTrigger value="logs">Flight Logs</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="gap-1.5">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
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
            <FlightLogTable onEdit={handleEdit} />
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

          <TabsContent value="manage" className="mt-6">
            <EntityManagement />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-6">
              <AdminPanel onNavigateToManage={() => setActiveTab('manage')} />
            </TabsContent>
          )}
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

      <Toaster />
    </div>
  );
}
