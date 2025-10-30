// json-validator/json-validator.js

export function init() {
    const textInput = document.getElementById('json-text-input');
    const lineNumbersDiv = document.getElementById('json-line-numbers');
    const validateButton = document.getElementById('json-validate-btn');
    const clearButton = document.getElementById('json-clear-btn');
    const compressButton = document.getElementById('json-compress-btn');
    const copyButton = document.getElementById('json-copy-btn');
    const resultDiv = document.getElementById('json-result');

    if (!textInput) return; // Don't run if the widget isn't on the page

    function updateLineNumbers() {
        const lineCount = textInput.value.split('\n').length || 1;
        lineNumbersDiv.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
    }

    function syncScroll() {
        lineNumbersDiv.scrollTop = textInput.scrollTop;
    }

    function clearAll() {
        textInput.value = '';
        resultDiv.textContent = '';
        resultDiv.className = '';
        updateLineNumbers();
    }

    function copyContent() {
        if (!textInput.value) return;

        navigator.clipboard.writeText(textInput.value).then(() => {
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = 'Copied!';
            setTimeout(() => {
                copyButton.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    function processJson(action) {
        const text = textInput.value;
        resultDiv.textContent = '';
        resultDiv.className = '';

        if (text.trim() === '') {
            resultDiv.textContent = 'Please enter some JSON to process.';
            resultDiv.className = 'error';
            return;
        }

        try {
            const parsedJson = JSON.parse(text);

            if (action === 'validate') {
                textInput.value = JSON.stringify(parsedJson, null, 2);
                resultDiv.textContent = 'Valid JSON';
                resultDiv.className = 'success';
            } else if (action === 'compress') {
                textInput.value = JSON.stringify(parsedJson);
                resultDiv.textContent = 'JSON Compressed';
                resultDiv.className = 'success';
            }

            updateLineNumbers();
            syncScroll();
        } catch (e) {
            resultDiv.textContent = e.message;
            resultDiv.className = 'error';
        }
    }

    textInput.addEventListener('input', updateLineNumbers);
    textInput.addEventListener('scroll', syncScroll);
    validateButton.addEventListener('click', () => processJson('validate'));
    compressButton.addEventListener('click', () => processJson('compress'));
    clearButton.addEventListener('click', clearAll);
    copyButton.addEventListener('click', copyContent);
    
    updateLineNumbers();
}