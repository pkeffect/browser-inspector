// app.js

import { init as initStorageInspector } from './storage/storage-main.js';
import { init as initDiffViewer } from './diff-viewer/diff-viewer.js';
import { init as initJsonValidator } from './json-validator/json-validator.js';
import { init as initYamlValidator } from './yaml-validator/yaml-validator.js';
import { initThemeSwitcher } from './theme-switcher.js';

// Wait for the DOM to be fully loaded before running any scripts
document.addEventListener('DOMContentLoaded', () => {

    const mainNav = document.getElementById('main-nav');
    const widgetContainers = document.querySelectorAll('.widget-container');
    
    const widgetInitializers = {
        'storage-inspector': initStorageInspector,
        'json-validator': initJsonValidator,
        'yaml-validator': initYamlValidator
    };

    function getWidgetPath(widgetName) {
        switch (widgetName) {
            case 'storage-inspector': return 'storage/storage-inspector-widget.html';
            case 'json-validator': return 'json-validator/json-validator-widget.html';
            case 'yaml-validator': return 'yaml-validator/yaml-validator-widget.html';
            default: return null;
        }
    }
    
    async function loadAndInitWidget(name) {
        const container = document.getElementById(`${name}-container`);
        if (!container || container.innerHTML.trim() !== '') return;
        const widgetPath = getWidgetPath(name);
        if (!widgetPath) { console.error(`No path for widget: ${name}`); return; }
        try {
            const widgetHtml = await (await fetch(widgetPath)).text();
            container.innerHTML = widgetHtml;
            if (widgetInitializers[name]) {
                widgetInitializers[name]();
            }
        } catch (error) {
            container.innerHTML = `<p style="color: red;">Error loading ${name} widget.</p>`;
            console.error(`Failed to load ${name}:`, error);
        }
    }

    function handleRouteChange() {
        const hash = window.location.hash || '#storage-inspector';
        const pageName = hash.substring(1);
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.hash === hash);
        });
        widgetContainers.forEach(container => {
            container.style.display = container.id === `${pageName}-container` ? 'block' : 'none';
        });
        loadAndInitWidget(pageName);
    }

    async function initializeApp() {
        // Initialize the theme switcher first, as it affects the whole page
        initThemeSwitcher(); 
        
        try {
            const diffViewerHtml = await (await fetch('./diff-viewer/diff-viewer-widget.html')).text();
            document.getElementById('diff-viewer-container').innerHTML = diffViewerHtml;
            const diffViewerApi = initDiffViewer();
            document.addEventListener('open-diff-viewer', (event) => {
                const { storage, storageKey, currentJsonText } = event.detail;
                diffViewerApi.show(storage, storageKey, currentJsonText);
            });
        } catch (e) {
            console.error("CRITICAL: Could not load Diff Viewer component.", e);
        }

        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange(); // Trigger for initial page load
    }

    initializeApp();
});