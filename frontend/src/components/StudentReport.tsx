import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useStudentReport } from '../hooks/useReports';

export default function StudentReport() {
  const { data: report, isLoading } = useStudentReport();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Report</CardTitle>
        <CardDescription>Total flight hours and aircraft hours by student.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !report || report.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No student data available.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
                <TableHead className="text-right">Total Aircraft Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((item) => (
                <TableRow key={item.studentId}>
                  <TableCell className="font-medium">{item.studentName}</TableCell>
                  <TableCell className="text-right">{item.totalHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.totalAircraftHours.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
