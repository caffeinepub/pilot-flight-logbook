import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';
import { format } from 'date-fns';

export default function ExportButton() {
  const { actor } = useActor();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!actor) {
      toast.error('Unable to export. Please try again.');
      return;
    }

    setIsExporting(true);
    try {
      const csvData = await actor.exportFlightLogsAsCSV();

      // Create blob and download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `Pilot_Flight_Logbook_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success('Flight logs exported successfully');
    } catch (error) {
      console.error('Error exporting flight logs:', error);
      toast.error('Failed to export flight logs. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting || !actor} size="lg">
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-5 w-5" />
          Export to CSV
        </>
      )}
    </Button>
  );
}
