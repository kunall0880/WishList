"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface UseTypewriterOptions {
  speed?: number; // Speed in milliseconds per character
  delay?: number; // Delay in milliseconds before starting
  onComplete?: () => void;
}

export function useTypewriter(
  text: string = "",
  options: UseTypewriterOptions = {}
) {
  const { speed = 15, delay = 0, onComplete } = options;
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion is requested, render text instantly
    if (reducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      if (onComplete) onComplete();
      return;
    }

    setDisplayedText("");
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      if (onComplete) onComplete();
      return;
    }

    let index = 0;
    let timer: NodeJS.Timeout;

    const startTyping = () => {
      timer = setInterval(() => {
        setDisplayedText((prev) => {
          const next = prev + text.charAt(index);
          index++;
          if (index >= text.length) {
            clearInterval(timer);
            setIsComplete(true);
            if (onComplete) onComplete();
          }
          return next;
        });
      }, speed);
    };

    const delayTimer = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimer);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, delay, reducedMotion, onComplete]);

  return { displayedText, isComplete };
}
