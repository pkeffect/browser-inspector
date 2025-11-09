// VERSION: 0.1.4
// app.js

import { init as initStorageInspector } from './storage-inspector-main.js';
import { initThemeSwitcher } from './theme-switcher.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('storage-inspector-container');
    
    async function loadStorageInspector() {
        if (!container || container.innerHTML.trim() !== '') return;
        
        try {
            const widgetHtml = await (await fetch('storage-inspector-widget.html')).text();
            container.innerHTML = widgetHtml;
            
            // Initialize theme switcher and storage inspector
            initThemeSwitcher();
            initStorageInspector();
        } catch (error) {
            container.innerHTML = `<p style="color: red;">Error loading Storage Inspector widget.</p>`;
            console.error('Failed to load Storage Inspector:', error);
        }
    }
    
    loadStorageInspector();
});
