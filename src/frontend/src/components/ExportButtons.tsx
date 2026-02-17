import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Download } from 'lucide-react';
import { downloadSvg, downloadPng } from '../utils/download';

interface ExportButtonsProps {
  svgString: string;
  filename: string;
}

export default function ExportButtons({ svgString, filename }: ExportButtonsProps) {
  const handleDownloadSvg = () => {
    downloadSvg(svgString, `${filename}.svg`);
  };

  const handleDownloadPng = async () => {
    await downloadPng(svgString, `${filename}.png`, 1024);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Export Logo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button onClick={handleDownloadSvg} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download SVG
          </Button>
          <Button onClick={handleDownloadPng} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
