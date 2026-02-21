import { useState, useEffect } from 'react';

/**
 * A custom hook that delays the update of a value until a specified delay has passed
 * since the last time the value was updated.
 *
 * @param value The value to debounce.
 * @param delay The delay in milliseconds (default: 500ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set a timer to update the debounced value after the specified delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes (or component unmounts) before the delay has passed
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
