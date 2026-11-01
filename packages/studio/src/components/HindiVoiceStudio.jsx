"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Hindi Voice Studio uses the browser's installed speech synthesis voices.
 * It does not require an API key. Audio availability depends on the browser
 * and operating system voice packs.
 */
export default function HindiVoiceStudio() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      setVoiceName((current) => current || available.find((v) => /^hi(-|_)?in$/i.test(v.lang))?.name || available[0]?.name || "");
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, []);

  const hindiVoices = useMemo(() => voices.filter((v) => /^hi(-|_)?/i.test(v.lang)), [voices]);
  const selectedVoice = voices.find((v) => v.name === voiceName);

  const speak = () => {
    if (!text.trim()) {
      setStatus("Enter Hindi text to speak.");
      return;
    }
    if (!window.speechSynthesis) {
      setStatus("Speech synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = selectedVoice?.lang || "hi-IN";
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setStatus("Speaking…");
    utterance.onend = () => setStatus("Playback complete.");
    utterance.onerror = (event) => setStatus(`Speech error: ${event.error}`);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setStatus("Stopped.");
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-5 md:p-7 text-white space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">Voice Studio</p>
        <h2 className="text-2xl font-bold mt-1">Hindi Text to Speech</h2>
        <p className="text-sm text-zinc-400 mt-2">Hindi text ko natural voice mein suno. Available voices browser aur device par depend karti hain.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Hindi text</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          maxLength={5000}
          placeholder="यहाँ हिंदी में अपना टेक्स्ट लिखें…"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-base outline-none focus:border-cyan-400"
        />
        <span className="block text-right text-xs text-zinc-500">{text.length}/5000</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="block text-sm font-semibold">Voice</span>
          <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
            {voices.length === 0 && <option value="">Browser voice load ho rahi hai…</option>}
            {voices.map((voice) => <option key={voice.name + voice.lang} value={voice.name}>{voice.name} ({voice.lang}) {/^hi(-|_)?/i.test(voice.lang) ? "· Hindi" : ""}</option>)}
          </select>
          <span className="text-xs text-zinc-500">{hindiVoices.length} Hindi voice(s) detected</span>
        </label>
        <div className="space-y-3">
          <label className="block">
            <span className="flex justify-between text-sm font-semibold"><span>Speed</span><span>{rate.toFixed(1)}×</span></span>
            <input className="w-full mt-2 accent-cyan-400" type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm font-semibold"><span>Pitch</span><span>{pitch.toFixed(1)}</span></span>
            <input className="w-full mt-2 accent-cyan-400" type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={speak} disabled={!text.trim()} className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-zinc-950 disabled:opacity-40">▶ Speak</button>
        <button type="button" onClick={stop} className="rounded-xl border border-zinc-600 px-6 py-3 font-semibold hover:bg-zinc-800">■ Stop</button>
      </div>
      <p role="status" aria-live="polite" className="text-sm text-zinc-300">{status}</p>
      <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">Note: Ye browser-based speech playback hai, MP3 export ya cloud voice generation nahi. MP3 export ke liye supported TTS API/model credentials aur endpoint configuration chahiye.</p>
    </div>
  );
}
