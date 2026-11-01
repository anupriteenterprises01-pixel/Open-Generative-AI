"use client";

import React, { useState } from "react";
import { generateSpeech } from "../muapi.js";

const VOICES = [
  { id: "hindi_female_1_v2", label: "Hindi Female 1" },
  { id: "hindi_female_2_v1", label: "Hindi Female 2" },
  { id: "hindi_male_1_v2", label: "Hindi Male" },
];
const EMOTIONS = ["neutral", "happy", "sad", "angry", "fearful", "surprised"];

export default function HindiVoiceStudio({ apiKey, onGenerationStart, onGenerationEnd, onGenerationComplete, onGenerationError }) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [emotion, setEmotion] = useState("neutral");
  const [format, setFormat] = useState("mp3");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!String(apiKey || "").trim()) {
      setError("MuAPI API key nahi mili. App mein apni API key configure karein.");
      return;
    }
    if (!text.trim()) {
      setError("Pehle Hindi text likhein.");
      return;
    }
    setBusy(true);
    setError("");
    setAudioUrl("");
    onGenerationStart?.();
    try {
      const result = await generateSpeech(apiKey, {
        prompt: text.trim(),
        voice_id: voice,
        speed,
        pitch,
        emotion,
        format,
        language_boost: "Hindi",
      });
      if (!result?.url) throw new Error("API ne audio URL return nahi kiya.");
      setAudioUrl(result.url);
      onGenerationComplete?.({ url: result.url, model: "minimax-speech-2.6-turbo", prompt: text.trim(), type: "audio" });
    } catch (e) {
      const message = e?.message || "Speech generate nahi ho payi.";
      setError(message);
      onGenerationError?.(message);
    } finally {
      setBusy(false);
      onGenerationEnd?.();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-5 md:p-7 text-white space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">AI Voice Studio</p>
        <h2 className="text-2xl font-bold mt-1">Hindi Text to Speech</h2>
        <p className="text-sm text-zinc-400 mt-2">MiniMax Speech 2.6 Turbo se Hindi voice generate karein aur audio download karein.</p>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Hindi text</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} maxLength={10000}
          placeholder="यहाँ हिंदी में अपना टेक्स्ट लिखें…" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-base outline-none focus:border-cyan-400" />
        <span className="block text-right text-xs text-zinc-500">{text.length}/10000</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2 block">
          <span className="block text-sm font-semibold">Hindi voice</span>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
            {VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </label>
        <label className="space-y-2 block">
          <span className="block text-sm font-semibold">Emotion</span>
          <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
            {EMOTIONS.map((v) => <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="flex justify-between text-sm font-semibold"><span>Speed</span><span>{speed.toFixed(1)}×</span></span>
          <input className="w-full mt-2 accent-cyan-400" type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="flex justify-between text-sm font-semibold"><span>Pitch</span><span>{pitch}</span></span>
          <input className="w-full mt-2 accent-cyan-400" type="range" min="-12" max="12" step="1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
        </label>
        <label className="space-y-2 block">
          <span className="block text-sm font-semibold">Audio format</span>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
            <option value="mp3">MP3</option><option value="wav">WAV</option><option value="flac">FLAC</option>
          </select>
        </label>
      </div>
      <button type="button" onClick={generate} disabled={busy || !text.trim()} className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-zinc-950 disabled:opacity-40">
        {busy ? "Generating voice…" : "Generate Hindi Voice"}
      </button>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {audioUrl && <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <p className="text-sm font-semibold text-cyan-300">Voice generated successfully</p>
        <audio controls src={audioUrl} className="w-full">Your browser does not support audio playback.</audio>
        <a href={audioUrl} download={`hindi-voice.${format}`} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-bold text-zinc-950">Download audio</a>
      </div>}
      <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">Cloud generation ke liye app ka MuAPI API key use hota hai. API usage par provider ke charges/limits lagu ho sakte hain.</p>
    </div>
  );
}
