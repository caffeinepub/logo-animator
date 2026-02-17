import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useLogoProjects } from '../hooks/useLogoProjects';
import { Loader2, FolderOpen } from 'lucide-react';
import type { GeneratedLogoProjectSerialized } from '../backend';

interface MyLogosPanelProps {
  onSelectProject: (project: GeneratedLogoProjectSerialized) => void;
}

export default function MyLogosPanel({ onSelectProject }: MyLogosPanelProps) {
  const { data: projects, isLoading } = useLogoProjects();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          My Logos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>No saved logos yet.</p>
            <p className="mt-1">Generate your first logo to get started!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {projects.map((project, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 px-3"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {project.description.slice(0, 60)}
                      {project.description.length > 60 ? '...' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(project.timestamp)}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
