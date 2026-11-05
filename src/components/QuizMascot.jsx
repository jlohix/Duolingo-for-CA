import { useEffect, useState } from "react";
import ConfettiBurst from "./ConfettiBurst";

const PACKS = {
  happy: {
    frames: [
      "/mascots/happy-sunwoo/frames/frame_01.png",
      "/mascots/happy-sunwoo/frames/frame_02.png",
      "/mascots/happy-sunwoo/frames/frame_03.png",
      "/mascots/happy-sunwoo/frames/frame_04.png",
      "/mascots/happy-sunwoo/frames/frame_05.png",
      "/mascots/happy-sunwoo/frames/frame_06.png",
      "/mascots/happy-sunwoo/frames/frame_07.png",
      "/mascots/happy-sunwoo/frames/frame_08.png",
    ],
    times: [150, 120, 110, 130, 110, 120, 140, 260],
    alt: "Sunwoo celebrating",
  },
  scary: {
    frames: [
      "/mascots/scary-sunwoo/frames/frame_01.png",
      "/mascots/scary-sunwoo/frames/frame_02.png",
      "/mascots/scary-sunwoo/frames/frame_03.png",
      "/mascots/scary-sunwoo/frames/frame_04.png",
      "/mascots/scary-sunwoo/frames/frame_05.png",
      "/mascots/scary-sunwoo/frames/frame_06.png",
      "/mascots/scary-sunwoo/frames/frame_07.png",
    ],
    times: [220, 150, 95, 85, 110, 155, 280],
    alt: "Sunwoo swinging a bat",
  },
};

const preloaded = new Set();

function preload(frames) {
  frames.forEach((src) => {
    if (preloaded.has(src)) return;
    preloaded.add(src);
    const image = new Image();
    image.src = src;
  });
}

export default function QuizMascot({ mood, playKey }) {
  const pack = PACKS[mood];
  const frames = pack?.frames || [];
  const [src, setSrc] = useState(frames[0] || "");
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (frames.length) preload(frames);
  }, [frames]);

  useEffect(() => {
    if (mood === "happy") setBurst((n) => n + 1);
  }, [mood, playKey]);

  useEffect(() => {
    if (!frames.length) return undefined;
    let i = 0;
    let timer = 0;
    const tick = () => {
      setSrc(frames[i]);
      const delay = pack.times[i] || 120;
      i = (i + 1) % frames.length;
      timer = window.setTimeout(tick, delay);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [mood, playKey, pack, frames]);

  if (!pack || !src) return null;

  return (
    <>
      {mood === "happy" && burst > 0 ? (
        <ConfettiBurst burstKey={burst} />
      ) : null}
      <div className={`quiz-mascot quiz-mascot-${mood}`}>
        <img src={src} alt={pack.alt} />
      </div>
    </>
  );
}
