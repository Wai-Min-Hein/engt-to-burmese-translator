import React, { useState } from 'react';
import { X, Book, Volume2, Loader2 } from 'lucide-react';
import { DictionaryEntry } from '../types';
import { getWordPronunciation } from '../services/geminiService';

interface DictionarySidebarProps {
  isOpen: boolean;
  isLoading: boolean;
  entry: DictionaryEntry | null;
  onClose: () => void;
  apiKey: string;
}

const DictionarySidebar: React.FC<DictionarySidebarProps> = ({
  isOpen,
  isLoading,
  entry,
  onClose,
  apiKey
}) => {
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const handlePlayAudio = async () => {
    if (!entry?.word || isAudioLoading || !apiKey) return;
    
    setIsAudioLoading(true);
    try {
      const base64Audio = await getWordPronunciation(entry.word, apiKey);
      
      // Initialize AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 });
      
      // Decode audio
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      // Play audio
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);

    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Book className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Dictionary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p>Looking up definition...</p>
            </div>
          ) : entry ? (
            <div className="space-y-6">
              {/* Word Title & Phonetic */}
              <div>
                <div className="flex items-end gap-3 mb-1">
                  <h3 className="text-3xl font-bold text-slate-900 capitalize leading-none">
                    {entry.word}
                  </h3>
                  
                  <button
                    onClick={handlePlayAudio}
                    disabled={isAudioLoading}
                    className="mb-1 p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    title="Listen to pronunciation"
                  >
                    {isAudioLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 text-slate-500 mt-2">
                  {entry.phonetic && (
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-sm">
                      {entry.phonetic}
                    </span>
                  )}
                  <span className="italic text-indigo-600 font-medium text-sm border border-indigo-100 px-2 py-0.5 rounded-full">
                    {entry.partOfSpeech}
                  </span>
                </div>
              </div>

              {/* Definition */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Definition</h4>
                <p className="text-slate-800 leading-relaxed text-lg">
                  {entry.definition}
                </p>
              </div>

               {/* Burmese Definition */}
               {entry.burmeseDefinition && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Burmese Meaning</h4>
                  <p className="text-slate-800 leading-relaxed font-burmese text-lg">
                    {entry.burmeseDefinition}
                  </p>
                </div>
              )}

              {/* Example */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Example</h4>
                <p className="text-slate-600 italic">
                  "{entry.exampleSentence}"
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
              <Book className="w-12 h-12 mb-4 opacity-20" />
              <p>Triple-click any English word to see its definition here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Helper functions for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default DictionarySidebar;