import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const phrases = ["o melhor lugar", "a equipe ideal", "a melhor empresa"];

const TYPING_DELAY = 170;
const DELETING_DELAY = 80;
const PAUSE_DELAY = 3000;
const longestPhraseLength = Math.max(...phrases.map((phrase) => phrase.length));

const TypingEffect = forwardRef<HTMLSpanElement>((_, ref) => {
  const [text, setText] = useState('');
  const spanRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const phraseIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const deletingRef = useRef(false);

  useImperativeHandle(ref, () => spanRef.current as HTMLSpanElement);

  useEffect(() => {
    let cancelled = false;

    const clearTimer = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const scheduleNextStep = (delay: number) => {
      clearTimer();
      timeoutRef.current = window.setTimeout(runStep, delay);
    };

    const runStep = () => {
      if (cancelled) return;

      const currentPhrase = phrases[phraseIndexRef.current];

      if (deletingRef.current) {
        charIndexRef.current = Math.max(0, charIndexRef.current - 1);
        setText(currentPhrase.slice(0, charIndexRef.current));

        if (charIndexRef.current === 0) {
          deletingRef.current = false;
          phraseIndexRef.current = (phraseIndexRef.current + 1) % phrases.length;
          scheduleNextStep(TYPING_DELAY);
          return;
        }

        scheduleNextStep(DELETING_DELAY);
        return;
      }

      charIndexRef.current = Math.min(currentPhrase.length, charIndexRef.current + 1);
      setText(currentPhrase.slice(0, charIndexRef.current));

      if (charIndexRef.current === currentPhrase.length) {
        deletingRef.current = true;
        scheduleNextStep(PAUSE_DELAY);
        return;
      }

      scheduleNextStep(TYPING_DELAY);
    };

    phraseIndexRef.current = 0;
    charIndexRef.current = 0;
    deletingRef.current = false;
    setText('');
    scheduleNextStep(TYPING_DELAY);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, []);

  return (
    <>
      <span
        ref={spanRef}
        className="typing-cursor notranslate inline-block overflow-hidden align-baseline"
        style={{ minWidth: `${longestPhraseLength}ch` }}
        translate="no"
        aria-hidden="true"
      >
        {text || '\u00A0'}
      </span>
      <span className="sr-only">o melhor lugar, a equipe ideal ou a melhor empresa</span>
    </>
  );
});

TypingEffect.displayName = 'TypingEffect';

export default TypingEffect;
