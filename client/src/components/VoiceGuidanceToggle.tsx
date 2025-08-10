import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Mic, MicOff, Settings, X, HelpCircle } from 'lucide-react';
import { useVoiceGuidanceContext } from '@/components/VoiceGuidanceProvider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function VoiceGuidanceToggle() {
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { 
    settings, 
    setSettings, 
    voices, 
    speaking, 
    listening,
    speak,
    stopSpeaking,
    toggleListening,
    readPageContent
  } = useVoiceGuidanceContext();

  useEffect(() => {
    setMounted(true);
    // Welcome message when first enabled
    const hasSeenWelcome = localStorage.getItem('voiceGuidanceWelcome');
    if (settings.enabled && !hasSeenWelcome) {
      speak('Welcome to MySeniorValet voice guidance. Press Alt plus H for help with keyboard shortcuts.', true);
      localStorage.setItem('voiceGuidanceWelcome', 'true');
    }
  }, [settings.enabled]);

  if (!mounted) return null;

  const toggleVoiceGuidance = () => {
    const newEnabled = !settings.enabled;
    setSettings({ ...settings, enabled: newEnabled });
    if (newEnabled) {
      speak('Voice guidance enabled. I will help you navigate the website.', true);
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    const voice = voices.find(v => v.voiceURI === voiceId) || null;
    setSettings({ ...settings, voice });
    if (voice) {
      speak('Voice changed. This is how I sound now.', true);
    }
  };

  return (
    <>
      {/* Accessibility Toolbar - Fixed Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-2 p-4 w-80 max-h-[600px] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Voice Guidance Settings</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Voice Selection */}
              <div>
                <Label htmlFor="voice-select">Voice</Label>
                <Select
                  value={settings.voice?.voiceURI || ''}
                  onValueChange={handleVoiceChange}
                >
                  <SelectTrigger id="voice-select">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map(voice => (
                      <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Speed Control */}
              <div>
                <Label htmlFor="speed-slider">
                  Speed: {settings.rate.toFixed(1)}x
                </Label>
                <Slider
                  id="speed-slider"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[settings.rate]}
                  onValueChange={([rate]) => setSettings({ ...settings, rate })}
                  className="mt-2"
                />
              </div>

              {/* Volume Control */}
              <div>
                <Label htmlFor="volume-slider">
                  Volume: {Math.round(settings.volume * 100)}%
                </Label>
                <Slider
                  id="volume-slider"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[settings.volume]}
                  onValueChange={([volume]) => setSettings({ ...settings, volume })}
                  className="mt-2"
                />
              </div>

              {/* Pitch Control */}
              <div>
                <Label htmlFor="pitch-slider">
                  Pitch: {settings.pitch.toFixed(1)}
                </Label>
                <Slider
                  id="pitch-slider"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[settings.pitch]}
                  onValueChange={([pitch]) => setSettings({ ...settings, pitch })}
                  className="mt-2"
                />
              </div>

              <Separator />

              {/* Feature Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-read-nav">Auto-read navigation</Label>
                  <Switch
                    id="auto-read-nav"
                    checked={settings.autoReadNavigation}
                    onCheckedChange={(autoReadNavigation) => 
                      setSettings({ ...settings, autoReadNavigation })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-read-content">Auto-read content</Label>
                  <Switch
                    id="auto-read-content"
                    checked={settings.autoReadContent}
                    onCheckedChange={(autoReadContent) => 
                      setSettings({ ...settings, autoReadContent })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-shortcuts">Keyboard shortcuts</Label>
                  <Switch
                    id="keyboard-shortcuts"
                    checked={settings.keyboardShortcuts}
                    onCheckedChange={(keyboardShortcuts) => 
                      setSettings({ ...settings, keyboardShortcuts })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Test Button */}
              <Button
                onClick={() => speak('This is a test of the voice guidance system. Adjust the settings to your preference.', true)}
                className="w-full"
                variant="outline"
              >
                Test Voice
              </Button>

              {/* Help Section */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Alt + V: Toggle voice on/off</li>
                  <li>• Alt + R: Read page content</li>
                  <li>• Alt + S: Stop speaking</li>
                  <li>• Alt + L: Voice commands</li>
                  <li>• Alt + H: Help</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {/* Voice Commands Button */}
          <Button
            size="lg"
            variant={listening ? "destructive" : "outline"}
            onClick={toggleListening}
            className="rounded-full shadow-lg"
            aria-label={listening ? "Stop voice commands" : "Start voice commands"}
            title={listening ? "Stop voice commands" : "Start voice commands (Alt+L)"}
          >
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Settings Button */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full shadow-lg"
            aria-label="Voice guidance settings"
            title="Voice guidance settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Main Toggle Button */}
          <Button
            size="lg"
            variant={settings.enabled ? "default" : "outline"}
            onClick={toggleVoiceGuidance}
            className={`rounded-full shadow-lg transition-all ${
              settings.enabled ? 'bg-blue-600 hover:bg-blue-700' : ''
            }`}
            aria-label={settings.enabled ? "Turn off voice guidance" : "Turn on voice guidance"}
            title={settings.enabled ? "Turn off voice guidance (Alt+V)" : "Turn on voice guidance (Alt+V)"}
          >
            {settings.enabled ? (
              speaking ? (
                <Volume2 className="h-5 w-5 animate-pulse" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Status Indicator */}
        {(speaking || listening) && (
          <div className="flex items-center justify-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
            {speaking && (
              <span className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <Volume2 className="h-3 w-3 animate-pulse" />
                Speaking...
              </span>
            )}
            {listening && (
              <span className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
                <Mic className="h-3 w-3 animate-pulse" />
                Listening...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Help Button - Top Right */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => speak('Voice guidance help: Use Alt plus V to toggle voice, Alt plus R to read page, Alt plus S to stop, Alt plus L for voice commands. Say "help" when using voice commands for more options.', true)}
        className="fixed top-20 right-4 z-40"
        aria-label="Voice guidance help"
        title="Voice guidance help (Alt+H)"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="ml-2 sr-only sm:not-sr-only">Voice Help</span>
      </Button>
    </>
  );
}