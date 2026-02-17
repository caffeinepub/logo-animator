import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface StaticLogoPreviewProps {
  svgString: string;
  wordmark: string;
}

export default function StaticLogoPreview({ svgString, wordmark }: StaticLogoPreviewProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Static Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Large preview */}
        <div className="bg-background/50 rounded-xl p-8 flex items-center justify-center border border-border/30">
          <div dangerouslySetInnerHTML={{ __html: svgString }} />
        </div>

        {/* Small previews */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4 flex items-center justify-center border border-border/30">
            <div 
              className="w-16 h-16"
              dangerouslySetInnerHTML={{ __html: svgString }} 
            />
          </div>
          <div className="bg-background/50 rounded-lg p-4 flex items-center justify-center border border-border/30">
            <div 
              className="w-16 h-16"
              dangerouslySetInnerHTML={{ __html: svgString }} 
            />
          </div>
          <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center border border-border/30">
            <div 
              className="w-16 h-16"
              dangerouslySetInnerHTML={{ __html: svgString }} 
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Wordmark:</span> {wordmark}
        </div>
      </CardContent>
    </Card>
  );
}
