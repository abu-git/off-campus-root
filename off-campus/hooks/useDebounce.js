// hooks/useDebounce.js

import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes (e.g., user keeps typing)
        // This is the key to how debounce works!
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run the effect if value or delay changes

    return debouncedValue;
}