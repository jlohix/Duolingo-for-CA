import { useEffect, useRef, useState } from "react";
import ConfettiBurst from "./ConfettiBurst";

const PACKS = {
  happy: {
    still: "/mascots/happy-sunwoo/celebration.png",
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
  const [src, setSrc] = useState(pack?.still || pack?.frames?.[0] || "");
  const [burst, setBurst] = useState(0);
  const cancelRef = useRef(0);

  useEffect(() => {
    if (pack?.frames) preload(pack.frames);
    if (pack?.still) preload([pack.still]);
  }, [pack]);

  useEffect(() => {
    if (mood === "happy") setBurst((n) => n + 1);
  }, [mood, playKey]);

  useEffect(() => {
    if (!pack?.frames) {
      if (pack?.still) setSrc(pack.still);
      return undefined;
    }
    const token = cancelRef.current + 1;
    cancelRef.current = token;
    setSrc(pack.frames[0]);

    let cancelled = false;
    (async () => {
      while (!cancelled && cancelRef.current === token) {
        for (let i = 0; i < pack.frames.length; i += 1) {
          if (cancelled || cancelRef.current !== token) return;
          setSrc(pack.frames[i]);
          await new Promise((resolve) => {
            setTimeout(resolve, pack.times[i]);
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mood, playKey, pack]);

  if (!pack) return null;

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
