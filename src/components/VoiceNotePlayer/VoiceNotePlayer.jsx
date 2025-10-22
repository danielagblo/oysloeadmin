import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import styles from "./voicenoteplayer.module.css";

/**
 * VoiceNotePlayer
 * - src: string (audio url)
 * - isSender: boolean (true = outgoing bubble styling)
 *
 * Uses CSS classes:
 * - audioMessage, playButton, progressBar, time (these are kept as you provided)
 *
 * Behavior:
 * - gets duration from loadedmetadata
 * - syncs play/pause/ended with audio element
 * - supports scrubbing (seek) with pointer/mouse/touch
 * - resumes playback if it was playing before the seek
 * - updates range background to show progress fill (works cross-browser)
 */
export const VoiceNotePlayer = ({ src, isSender = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // while user scrubs, we don't want timeupdate to overwrite local seek preview
  const seekingRef = useRef(false);
  const wasPlayingRef = useRef(false);

  // format mm:ss
  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // update range background to show progress fill
  const setRangeBackground = (el, percent) => {
    if (!el) return;
    // use the green thumb color to fill (keeps your style)
    el.style.background = `linear-gradient(to right, var(--audio-fill, #25d366) ${percent}%, #ddd ${percent}%)`;
  };

  // attach listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      // ensure UI shows correct initial background
      const percent = audio.duration
        ? (audio.currentTime / audio.duration) * 100
        : 0;
      const rangeEl = document.querySelector(`#voice-range-${idSuffix()}`);
      if (rangeEl) setRangeBackground(rangeEl, percent);
    };
    const onTime = () => {
      if (!seekingRef.current) {
        setCurrentTime(audio.currentTime);
        const percent = audio.duration
          ? (audio.currentTime / audio.duration) * 100
          : 0;
        const rangeEl = document.querySelector(`#voice-range-${idSuffix()}`);
        if (rangeEl) setRangeBackground(rangeEl, percent);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
      const rangeEl = document.querySelector(`#voice-range-${idSuffix()}`);
      if (rangeEl) setRangeBackground(rangeEl, 100);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // small helper to create a stable id for the range element (so multiple players don't clash)
  const localIdRef = useRef(Math.random().toString(36).slice(2, 9));
  const idSuffix = () => localIdRef.current;

  // toggle play/pause and handle play promise
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        const p = audio.play();
        if (p !== undefined) {
          // avoid uncaught promise if play blocked
          await p.catch(() => {});
        }
      }
      // play/pause events will update state
    } catch (err) {
      console.warn("VoiceNote play error", err);
    }
  };

  // range interaction handlers
  const onSeekStart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    seekingRef.current = true;
    wasPlayingRef.current = !audio.paused;
    if (!audio.paused) audio.pause(); // pause while dragging
  };

  const onSeeking = (e) => {
    const el = e.target;
    const percent = Number(el.value);
    const newTime = (percent / 100) * (duration || 0);
    setCurrentTime(newTime);
    setRangeBackground(el, percent);
  };

  const onSeekEnd = (e) => {
    const el = e.target;
    const percent = Number(el.value);
    const newTime = (percent / 100) * (duration || 0);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = newTime;
    seekingRef.current = false;
    // resume if it was playing before
    if (wasPlayingRef.current) {
      const p = audio.play();
      if (p !== undefined) p.catch(() => {});
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`${styles.audioMessage} ${isSender ? styles.sender : ""}`}
      role="group"
      aria-label="voice note"
    >
      <button
        className={styles.playButton}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
        onClick={togglePlay}
        type="button"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Range uses your .progressBar class name */}
      <input
        id={`voice-range-${idSuffix()}`}
        className={styles.progressBar}
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={Number(progressPercent.toFixed(1))}
        onMouseDown={onSeekStart}
        onTouchStart={onSeekStart}
        onPointerDown={onSeekStart}
        onChange={onSeeking}
        onMouseUp={onSeekEnd}
        onTouchEnd={onSeekEnd}
        onPointerUp={onSeekEnd}
        aria-label="Seek voice note"
      />

      <div className={styles.time}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Hidden native audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};
