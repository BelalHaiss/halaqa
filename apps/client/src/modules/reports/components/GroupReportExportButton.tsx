import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { GroupReportDTO } from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import { buildGroupReportFileName, buildGroupReportSheetData } from '../utils/report-export.util';

type GroupReportExportButtonProps = {
  report: GroupReportDTO | null;
};

export function GroupReportExportButton({ report }: GroupReportExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!report) {
      return;
    }

    setIsExporting(true);
    try {
      const { default: writeExcelFile } = await import('write-excel-file/browser');
      const sheetData = buildGroupReportSheetData(report);
      await writeExcelFile(sheetData, { rightToLeft: true }).toFile(
        buildGroupReportFileName(report)
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant='outline'
      color='primary'
      onClick={handleExport}
      disabled={!report || isExporting}
    >
      {isExporting ? <Loader2 className='animate-spin' /> : <Download />}
      تصدير Excel
    </Button>
  );
}
