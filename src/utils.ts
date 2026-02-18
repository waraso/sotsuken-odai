export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function generateValidationRegex(allowedChars: string[]): RegExp {
    const sortedChars = [...allowedChars].sort((a, b) => b.length - a.length);
    const escapedChars = sortedChars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`^(${escapedChars.join('|')})+$`);
}
