import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';
import { useMadrasa } from '../../context/MadrasaContext';
import { recitationAudioEngine } from '../../utils/audioPlayer';

interface AudioRecitationPlayerProps {
  blobKey?: string;
  audioUrl?: string;
  studentName?: string;
  surahNumber?: number;
  ayahStart?: number;
}

export const AudioRecitationPlayer: React.FC<AudioRecitationPlayerProps> = ({
  blobKey,
  audioUrl,
  studentName,
  surahNumber = 3,
  ayahStart = 130,
}) => {
  const { getAudioRecitationUrl } = useMadrasa();
  const [playableUrl, setPlayableUrl] = useState<string | null>(audioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const playerId = `player-${blobKey || audioUrl || studentName || 'default'}-${surahNumber}`;

  useEffect(() => {
    let active = true;
    const resolveUrl = async () => {
      if (blobKey) {
        setIsLoading(true);
        try {
          const url = await getAudioRecitationUrl(blobKey);
          if (active && url) {
            setPlayableUrl(url);
          }
        } catch (err) {
          console.warn('[AudioPlayer] Blob retrieval fallback:', err);
        } finally {
          if (active) setIsLoading(false);
        }
      } else if (audioUrl) {
        setPlayableUrl(audioUrl);
      }
    };

    resolveUrl();

    // Subscribe to global audio engine state
    const unsubscribe = recitationAudioEngine.subscribe((playing, activeId) => {
      setIsPlaying(playing && activeId === playerId);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [blobKey, audioUrl, getAudioRecitationUrl, playerId]);

  const togglePlay = () => {
    if (isPlaying) {
      recitationAudioEngine.stop();
    } else {
      recitationAudioEngine.play({
        id: playerId,
        audioUrl: playableUrl,
        surahNumber,
        ayahStart,
        durationSeconds: 14,
        studentName,
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
          title={isPlaying ? 'Pause Recitation' : 'Play Recitation'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>
        <div>
          <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{studentName ? `${studentName}'s Recitation` : 'Recitation Audio'}</span>
          </p>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
            {isLoading
              ? 'Loading audio...'
              : isPlaying
              ? 'Playing recitation sound...'
              : 'Click to listen to student recitation'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 pr-1">
        {[25, 55, 85, 45, 75, 95, 65, 35, 80, 50].map((h, i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isPlaying
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-emerald-300/80 dark:bg-emerald-700/60'
            }`}
            style={{
              height: `${isPlaying ? (h * ((i % 3) + 1)) / 3 : 10}px`,
              animationDelay: `${i * 90}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

