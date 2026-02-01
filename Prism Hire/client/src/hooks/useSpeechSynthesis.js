import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    const synth = useRef(window.speechSynthesis);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSupported(true);

            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
            };

            loadVoices();

            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, []);

    const speak = useCallback((text, voiceIndex = null, pitch = 1, rate = 1) => {
        if (!supported || !text) return;

        // Cancel any current speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Select voice if specified, or try to find a good default (like Google US English)
        if (voiceIndex !== null && voices[voiceIndex]) {
            utterance.voice = voices[voiceIndex];
        } else {
            const defaultVoice = voices.find(v => v.lang === 'en-US' && !v.name.includes("Microsoft")) || voices[0];
            if (defaultVoice) utterance.voice = defaultVoice;
        }

        utterance.pitch = pitch;
        utterance.rate = rate;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setIsSpeaking(false);
        }

        window.speechSynthesis.speak(utterance);
    }, [voices, supported]);

    const cancel = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [supported]);

    return {
        voices,
        isSpeaking,
        speak,
        cancel,
        supported
    };
};

export default useSpeechSynthesis;
