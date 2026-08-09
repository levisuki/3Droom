// src/composables/useAudio.js
import { ref } from 'vue';

const audioElement = ref(null);
const isPlaying = ref(false);

export function useAudio() {
    const initAudio = (el) => {
        audioElement.value = el;
        el.addEventListener('ended', () => {
            isPlaying.value = false;
        });
    };

    const play = () => {
        if (!audioElement.value) return;
        audioElement.value.play();
        isPlaying.value = true;
    };

    const pause = () => {
        if (!audioElement.value) return;
        audioElement.value.pause();
        isPlaying.value = false;
    };

    const togglePlay = () => {
        isPlaying.value ? pause() : play();
    };

    return {
        isPlaying,
        initAudio,
        play,
        pause,
        togglePlay,
    };
}