/**
 * Theme Toggle Script - HirePrep
 * Detects system preference, persists user choice, works across all pages.
 * Uses a unified localStorage key: 'hireprep_theme'
 */
(function() {
    const root = document.documentElement;

    // Detect system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('hireprep_theme');
    const theme = saved || (systemPrefersDark ? 'dark' : 'light');

    // Apply immediately (before DOMContentLoaded to prevent flash)
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.removeAttribute('data-theme');
    }

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('hireprep_theme')) {
            if (e.matches) root.setAttribute('data-theme', 'dark');
            else root.removeAttribute('data-theme');
            updateToggleIcons();
        }
    });

    // Update all toggle icons on page
    function updateToggleIcons() {
        const isDark = root.getAttribute('data-theme') === 'dark';
        document.querySelectorAll('#themeToggle, #theme-toggle').forEach(btn => {
            btn.textContent = isDark ? '🌙' : '☼';
        });
    }

    // Global toggle function
    window.toggleTheme = function() {
        const isDark = root.getAttribute('data-theme') === 'dark';
        if (isDark) {
            root.removeAttribute('data-theme');
            localStorage.setItem('hireprep_theme', 'light');
        } else {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('hireprep_theme', 'dark');
        }
        updateToggleIcons();
    };

    document.addEventListener('DOMContentLoaded', updateToggleIcons);
})();
