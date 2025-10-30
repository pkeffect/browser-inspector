// utils.js

/**
 * Displays a tooltip, automatically positioning it above or below the target element
 * to stay within the bounds of the parent card.
 * @param {HTMLElement} tooltipEl - The tooltip element.
 * @param {HTMLElement} cardEl - The parent card element for boundary checks.
 * @param {string} message - The text to display in the tooltip.
 * @param {HTMLElement} targetEl - The element to position the tooltip relative to.
 * @param {object} [options={}] - Options object.
 * @param {boolean} [options.isWarning=false] - If true, applies 'warning' class.
 * @param {number} [options.duration=2000] - Duration in ms to show the tooltip.
 */
export function showTooltip(tooltipEl, cardEl, message, targetEl, options = {}) {
    const { isWarning = false, duration = 2000 } = options;
    if (!tooltipEl || !cardEl || !targetEl) return;

    clearTimeout(tooltipEl.timer);

    tooltipEl.textContent = message;
    tooltipEl.classList.toggle('warning', isWarning);
    tooltipEl.classList.add('show'); // Show it temporarily to get its dimensions

    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    // Calculate initial position (centered above the target)
    let top = targetRect.top - cardRect.top - tooltipRect.height - 5;
    let left = targetRect.left - cardRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

    // If the tooltip would go above the card, position it below the target instead
    if ((targetRect.top - tooltipRect.height - 5) < cardRect.top) {
        top = targetRect.bottom - cardRect.top + 5;
    }

    // Clamp horizontal position to stay within the card
    left = Math.max(0, Math.min(left, cardRect.width - tooltipRect.width));

    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;

    if (duration > 0) {
        tooltipEl.timer = setTimeout(() => {
            tooltipEl.classList.remove('show');
        }, duration);
    }
}