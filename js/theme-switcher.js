// theme-switcher.js

export function initThemeSwitcher() {
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');

    if (!themeToggle) {
        console.error("Theme toggle button with id 'theme-toggle' not found.");
        return;
    }

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            htmlElement.dataset.theme = 'dark';
        } else {
            htmlElement.removeAttribute('data-theme');
        }
    };

    const toggleTheme = () => {
        const currentTheme = htmlElement.dataset.theme ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    themeToggle.addEventListener('click', toggleTheme);

    // Initialization
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    applyTheme(initialTheme);
}