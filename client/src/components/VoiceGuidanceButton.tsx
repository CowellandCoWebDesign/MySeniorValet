import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Mic, MicOff, Settings, X, HelpCircle, ChevronRight } from 'lucide-react';
import { useVoiceGuidanceContext } from '@/components/VoiceGuidanceProvider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";

export function VoiceGuidanceButton() {
  const [showPopover, setShowPopover] = useState(false);
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

  const toggleVoiceGuidance = () => {
    const newEnabled = !settings.enabled;
    setSettings({ ...settings, enabled: newEnabled });
    if (newEnabled) {
      speak('Voice guidance enabled. I will help you navigate the website.', true);
    } else {
      stopSpeaking();
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
    <Popover open={showPopover} onOpenChange={setShowPopover}>
      <PopoverTrigger asChild>
        <Button
          variant={settings.enabled ? "default" : "outline"}
          size="icon"
          className={cn(
            "relative rounded-xl transition-all duration-300",
            settings.enabled && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
            speaking && "voice-speaking",
            listening && "ring-2 ring-green-500 ring-offset-2"
          )}
          aria-label={settings.enabled ? "Voice guidance is on" : "Voice guidance is off"}
        >
          {settings.enabled ? (
            speaking ? (
              <Volume2 className="h-5 w-5 text-white animate-pulse" />
            ) : listening ? (
              <Mic className="h-5 w-5 text-white animate-pulse" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
          {(speaking || listening) && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 z-[100]" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Voice Guidance</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPopover(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pb-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-enabled">Voice Guidance</Label>
              <Switch
                id="voice-enabled"
                checked={settings.enabled}
                onCheckedChange={toggleVoiceGuidance}
              />
            </div>

            {settings.enabled && (
              <>
                <Separator />
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => readPageContent()}
                      disabled={speaking}
                      className="flex items-center gap-1"
                    >
                      <Volume2 className="h-4 w-4" />
                      Read Page
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleListening}
                      className={cn(
                        "flex items-center gap-1",
                        listening && "bg-green-50 border-green-500"
                      )}
                    >
                      {listening ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Listen
                        </>
                      )}
                    </Button>
                    
                    {speaking && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={stopSpeaking}
                        className="col-span-2"
                      >
                        Stop Speaking
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Voice</Label>
                  <Select
                    value={settings.voice?.voiceURI || ''}
                    onValueChange={handleVoiceChange}
                  >
                    <SelectTrigger id="voice-select">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="speed">Speed</Label>
                    <span className="text-sm text-muted-foreground">{settings.rate}x</span>
                  </div>
                  <Slider
                    id="speed"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[settings.rate]}
                    onValueChange={(value) => setSettings({ ...settings, rate: value[0] })}
                  />
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="volume">Volume</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
                  </div>
                  <Slider
                    id="volume"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[settings.volume]}
                    onValueChange={(value) => setSettings({ ...settings, volume: value[0] })}
                  />
                </div>

                <Separator />

                {/* Keyboard Shortcuts */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      speak('Keyboard shortcuts: Alt plus V to toggle voice. Alt plus R to read page. Alt plus S to stop. Alt plus L for voice commands. Alt plus H for help.', true);
                    }}
                    className="w-full justify-start"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Keyboard Shortcuts
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}