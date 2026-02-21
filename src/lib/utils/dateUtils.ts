/**
 * Common date utilities for handling UTC to Local conversion and formatting.
 * Backend provides UTC strings, which are converted to local browser/device time here.
 */

/**
 * Converts a UTC date string or Date object to a local Date object.
 * JS `new Date()` automatically parses UTC strings and treats them as UTC if they 
 * have 'Z' or offset, performing the conversion to local time.
 */
export const toLocalTime = (utcDate: string | Date | number): Date => {
    if (typeof utcDate === 'string') {
        // If it's an ISO string but missing the 'Z' or offset, append 'Z' to force UTC parsing
        if (utcDate.includes('T') && !utcDate.endsWith('Z') && !utcDate.includes('+') && !/[-+]\d{2}:\d{2}$/.test(utcDate)) {
            return new Date(`${utcDate}Z`);
        }
        // If it's a SQL format string (space instead of T), convert to ISO and append Z
        if (!utcDate.includes('T') && utcDate.includes(' ')) {
            return new Date(`${utcDate.replace(' ', 'T')}Z`);
        }
    }
    return new Date(utcDate);
};

/**
 * Formats a date to a user-friendly local string (e.g., "Oct 24, 2023").
 */
export const formatLocalDate = (date: string | Date | number, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string => {
    const localDate = toLocalTime(date);
    return localDate.toLocaleDateString(undefined, options);
};

/**
 * Formats a date to a user-friendly local time string (e.g., "2:30 PM").
 */
export const formatLocalTime = (date: string | Date | number): string => {
    const localDate = toLocalTime(date);
    return localDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Returns a relative time string (e.g., "2 hours ago", "Yesterday").
 */
export const formatRelativeTime = (date: string | Date | number): string => {
    const localDate = toLocalTime(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - localDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';

    return formatLocalDate(localDate);
};

/**
 * Returns a YYYY-MM-DD string for the local date of the given Date object,
 * avoiding time zone shifts that occur with toISOString().
 */
export const getISODateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 */
export const getTodayISODate = (): string => {
    return getISODateString(new Date());
};
