import Header from './components/Header';
import AudioInfoPanel from './components/AudioInfo';
import QuickTools from './components/QuickTools';
import PresetGrid from './components/PresetGrid';
import Equalizer from './components/Equalizer';
import Compressor from './components/Compressor';
import Footer from './components/Footer';
import { useAudioSettings } from './hooks/useAudioSettings';

function App() {
  const { 
    settings, 
    updateSettings, 
    audioInfo, 
    activePreset, 
    applyPreset 
  } = useAudioSettings();

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <Header enabled={settings.enabled} onToggle={(v) => updateSettings({ enabled: v })} />
      
      {settings.enabled && <AudioInfoPanel info={audioInfo} />}

      <div className={`flex-1 overflow-y-auto scrollbar-thin ${!settings.enabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <QuickTools settings={settings} updateSettings={updateSettings} />
        <PresetGrid activePreset={activePreset} onSelect={applyPreset} />
        <Equalizer settings={settings} updateSettings={updateSettings} disabled={settings.loudnessMode} />
        <Compressor settings={settings} updateSettings={updateSettings} disabled={settings.smartVolume} />
        <Footer />
      </div>
    </div>
  );
}

export default App;
