import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Play, Pause } from 'lucide-react';
import { renderAnimatedSvg } from '../logo/renderAnimatedSvg';
import type { LogoSpecification } from '../backend';

interface AnimatedLogoPreviewProps {
  svgString: string;
  speed: number;
  isPlaying: boolean;
  onSpeedChange: (speed: number) => void;
  onPlayPauseToggle: () => void;
}

export default function AnimatedLogoPreview({
  svgString,
  speed,
  isPlaying,
  onSpeedChange,
  onPlayPauseToggle
}: AnimatedLogoPreviewProps) {
  const [key, setKey] = useState(0);

  // Restart animation when play is toggled or speed changes
  useEffect(() => {
    if (isPlaying) {
      setKey(prev => prev + 1);
    }
  }, [isPlaying, speed]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Animated Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Animation display */}
        <div className="bg-background/50 rounded-xl p-8 flex items-center justify-center border border-border/30 min-h-[400px]">
          {isPlaying ? (
            <div key={key} dangerouslySetInnerHTML={{ __html: svgString }} />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <Play className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">Click Play to see the animation</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onPlayPauseToggle}
              className="shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="speed-slider" className="text-sm font-medium">
                  Animation Speed
                </Label>
                <span className="text-sm text-muted-foreground">{speed.toFixed(1)}x</span>
              </div>
              <Slider
                id="speed-slider"
                min={0.5}
                max={3}
                step={0.1}
                value={[speed]}
                onValueChange={(values) => onSpeedChange(values[0])}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
