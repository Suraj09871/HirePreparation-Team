/**
 * HirePrep Sanitization Utility
 * Prevents XSS attacks by escaping HTML in user-supplied data before DOM insertion.
 * 
 * Usage:
 *   Instead of:  element.innerHTML = `<p>${userData}</p>`;
 *   Use:         element.innerHTML = `<p>${sanitize(userData)}</p>`;
 * 
 * Or use safeHTML for tagged template literals:
 *   element.innerHTML = safeHTML`<p>${userData}</p>`;
 */

/**
 * Escape HTML special characters to prevent XSS.
 * @param {*} str - The string to sanitize
 * @returns {string} - HTML-escaped string safe for innerHTML insertion
 */
function sanitize(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
}

/**
 * Tagged template literal for safe HTML construction.
 * Automatically sanitizes all interpolated values.
 * 
 * Usage: element.innerHTML = safeHTML`<p>${userInput}</p>`;
 * 
 * @param {TemplateStringsArray} strings - Template literal strings
 * @param  {...any} values - Interpolated values to sanitize
 * @returns {string} - Safe HTML string
 */
function safeHTML(strings, ...values) {
    return strings.reduce((result, str, i) => {
        const val = i < values.length ? sanitize(values[i]) : '';
        return result + str + val;
    }, '');
}
