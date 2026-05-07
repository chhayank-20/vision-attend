/**
 * Converts a base64 data URL to a Blob object.
 * This is more robust than using fetch() for data URLs, especially on mobile browsers.
 * @param {string} base64 - The base64 string (data:image/jpeg;base64,...)
 * @returns {Blob}
 */
export function base64ToBlob(base64) {
    try {
        const parts = base64.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    } catch (e) {
        console.error("Failed to convert base64 to blob", e);
        return null;
    }
}
