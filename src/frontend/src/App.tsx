import { useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useCurrentUserProfile';
import { useLogoGeneration } from './hooks/useLogoGeneration';
import { useLogoProjects, useSaveLogoProject } from './hooks/useLogoProjects';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import StaticLogoPreview from './components/StaticLogoPreview';
import AnimatedLogoPreview from './components/AnimatedLogoPreview';
import ExportButtons from './components/ExportButtons';
import MyLogosPanel from './components/MyLogosPanel';
import { Textarea } from './components/ui/textarea';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import type { LogoSpecification } from './backend';

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [description, setDescription] = useState('');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const { generate, generatedLogo, isGenerating, error, retry } = useLogoGeneration();
  const saveProject = useSaveLogoProject();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    const result = await generate(description);
    
    // Save to backend if authenticated
    if (result && isAuthenticated) {
      try {
        await saveProject.mutateAsync({
          description,
          logoSpec: result.specification as LogoSpecification
        });
      } catch (err) {
        console.error('Failed to save project:', err);
      }
    }
  };

  const handleSelectProject = (project: any) => {
    setDescription(project.description);
    // Regenerate from the saved specification
    generate(project.description);
  };

  const handleProfileSave = async (name: string) => {
    await saveProfile.mutateAsync({ name });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/app-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Subtle grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(var(--foreground) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, oklch(var(--foreground) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/app-icon.dim_512x512.png" 
                alt="Logo Animator" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight">Logo Animator</h1>
                <p className="text-xs text-muted-foreground">Design & Animate Your Brand</p>
              </div>
            </div>
            <LoginButton />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Input & Projects */}
            <div className="lg:col-span-1 space-y-6">
              {/* Generation Form */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-chart-1" />
                      Describe Your Logo
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Tell us about your company and the vibe you want
                    </p>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., A modern tech startup focused on AI and machine learning. We want something sleek, futuristic, and trustworthy..."
                      className="min-h-[140px] resize-none bg-background/50"
                      disabled={isGenerating}
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!description.trim() || isGenerating}
                    className="w-full h-11 text-base font-semibold"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Logo
                      </>
                    )}
                  </Button>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button variant="outline" size="sm" onClick={retry}>
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* My Logos Panel */}
              {isAuthenticated && <MyLogosPanel onSelectProject={handleSelectProject} />}
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-2 space-y-6">
              {generatedLogo ? (
                <>
                  {/* Static Preview */}
                  <StaticLogoPreview
                    svgString={generatedLogo.staticSvg}
                    wordmark={generatedLogo.wordmark}
                  />

                  {/* Animated Preview */}
                  <AnimatedLogoPreview
                    svgString={generatedLogo.animatedSvg}
                    speed={animationSpeed}
                    isPlaying={isPlaying}
                    onSpeedChange={setAnimationSpeed}
                    onPlayPauseToggle={() => setIsPlaying(!isPlaying)}
                  />

                  {/* Export Options */}
                  <ExportButtons
                    svgString={generatedLogo.staticSvg}
                    filename={generatedLogo.wordmark.toLowerCase().replace(/\s+/g, '-')}
                  />
                </>
              ) : (
                <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold">Ready to Create</h3>
                    <p className="text-muted-foreground">
                      Describe your company and vision in the input field, then click Generate Logo to see your design come to life.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 backdrop-blur-sm bg-background/80 mt-16">
          <div className="container mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Logo Animator · Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>

      {/* Profile Setup Dialog */}
      {showProfileSetup && (
        <ProfileSetupDialog
          open={showProfileSetup}
          onSave={handleProfileSave}
          isSaving={saveProfile.isPending}
        />
      )}
    </div>
  );
}
