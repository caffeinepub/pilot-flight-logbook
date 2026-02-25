import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useInstructorReport } from '../hooks/useReports';

export default function InstructorReport() {
  const { data: report, isLoading } = useInstructorReport();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructor Report</CardTitle>
        <CardDescription>Total flight hours, aircraft hours, and flight count by instructor.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !report || report.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No instructor data available.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor Name</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
                <TableHead className="text-right">Total Aircraft Hours</TableHead>
                <TableHead className="text-right">Flight Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((item) => (
                <TableRow key={item.instructorId}>
                  <TableCell className="font-medium">{item.instructorName}</TableCell>
                  <TableCell className="text-right">{item.totalHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.totalAircraftHours.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{item.flightCount.toString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
