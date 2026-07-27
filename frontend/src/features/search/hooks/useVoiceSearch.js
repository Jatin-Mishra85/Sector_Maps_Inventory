import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access was denied. Please allow it to use voice search.',
  'no-speech': 'No speech detected. Please try again.',
  'audio-capture': 'No microphone was found. Please check your device.',
  network: 'Network error during voice search. Please try again.',
  'service-not-allowed': 'Voice search is not available right now. Please try again.',
  aborted: 'Voice search stopped unexpectedly. Please try again.',
};

export function useVoiceSearch({ onResult, onError, lang = 'en-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => !!getSpeechRecognitionCtor());
  const [error, setError] = useState(null);
  // Naya: live partial transcript, jab tak final result nahi aata.
  // Overlay mein "Listening..." ki jagah ye dikhta hai jaise-jaise user bolta hai.
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const userStoppedRef = useRef(false);

  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!isSupported) return undefined;

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    // Naya: interim results on — overlay ko live text chahiye.
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[useVoiceSearch] recognition started — listening now.');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) {
        setInterimTranscript(interim);
      }
      if (final) {
        console.log('[useVoiceSearch] got final transcript:', final);
        setInterimTranscript('');
        onResultRef.current?.(final.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('[useVoiceSearch] recognition error:', event.error);
      if (event.error === 'aborted' && userStoppedRef.current) {
        userStoppedRef.current = false;
        setIsListening(false);
        setInterimTranscript('');
        return;
      }
      setError(event.error);
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      console.log('[useVoiceSearch] recognition ended.');
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    };
  }, [isSupported, lang]);

  useEffect(() => {
    if (!error) return;
    const message = ERROR_MESSAGES[error];
    if (message) onErrorRef.current?.(error, message);
  }, [error]);

  const startListening = useCallback(() => {
    if (isListening) return;
    if (!recognitionRef.current) {
      console.warn('[useVoiceSearch] mic clicked before recognition was ready — try again.');
      return;
    }

    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const message =
        'Voice search needs a secure connection (https:// or localhost). It will not work on this address.';
      setError('insecure-context');
      onErrorRef.current?.('insecure-context', message);
      console.warn('[useVoiceSearch] blocked — insecure context (not https/localhost).');
      return;
    }

    setError(null);
    setInterimTranscript('');
    userStoppedRef.current = false;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('[useVoiceSearch] recognition.start() failed:', err);
      const message = 'Could not start voice search. Please try again.';
      setError('start-failed');
      onErrorRef.current?.('start-failed', message);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    userStoppedRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, interimTranscript, error, startListening, stopListening };
}