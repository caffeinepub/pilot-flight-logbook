import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFlightLogs, useDeleteFlightLog } from '../hooks/useFlightLogs';
import type { FlightLog } from '../backend';

interface FlightLogTableProps {
  onEdit: (log: FlightLog) => void;
}

export default function FlightLogTable({ onEdit }: FlightLogTableProps) {
  const { data: flightLogs, isLoading } = useFlightLogs();
  const deleteFlightLog = useDeleteFlightLog();
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteFlightLog.mutateAsync(deleteId);
        toast.success('Flight log deleted successfully');
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting flight log:', error);
        toast.error('Failed to delete flight log. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Flight Log Entries</CardTitle>
          <CardDescription>View and manage all flight log entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {!flightLogs || flightLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No flight logs yet. Create your first entry to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Aircraft</TableHead>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Landings</TableHead>
                    <TableHead>Times</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Aircraft Hours</TableHead>
                    <TableHead>Sunrise</TableHead>
                    <TableHead>Sunset</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flightLogs.map((log) => (
                    <TableRow key={log.id.toString()}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.studentName}</TableCell>
                      <TableCell>{log.instructorName}</TableCell>
                      <TableCell>{log.aircraftRegistration}</TableCell>
                      <TableCell>{log.exerciseName}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{log.flightType}</div>
                          <div className="text-muted-foreground">{log.landingType}</div>
                        </div>
                      </TableCell>
                      <TableCell>{log.landingCount.toString()}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{log.takeoffTime} - {log.landingTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>{log.totalHours.toFixed(2)}h</TableCell>
                      <TableCell>
                        {log.aircraftHours > 0 ? log.aircraftHours.toFixed(1) : '—'}
                      </TableCell>
                      <TableCell>
                        {log.sunriseTime || '—'}
                      </TableCell>
                      <TableCell>
                        {log.sunsetTime || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(log)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(log.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the flight log entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
