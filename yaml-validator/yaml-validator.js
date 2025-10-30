// yaml-validator/yaml-validator.js

export function init() {
    const textInput = document.getElementById('yaml-text-input');
    const lineNumbersDiv = document.getElementById('yaml-line-numbers');
    const validateButton = document.getElementById('yaml-validate-btn');
    const clearButton = document.getElementById('yaml-clear-btn');
    const minifyButton = document.getElementById('yaml-minify-btn');
    const copyButton = document.getElementById('yaml-copy-btn');
    const resultDiv = document.getElementById('yaml-result');

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

    function processYaml(action) {
        const text = textInput.value;
        resultDiv.textContent = '';
        resultDiv.className = '';

        if (text.trim() === '') {
            resultDiv.textContent = 'Please enter some YAML to process.';
            resultDiv.className = 'error';
            return;
        }

        try {
            // js-yaml is loaded globally from the script tag in index.html
            const parsedYaml = jsyaml.load(text);

            if (action === 'validate') {
                textInput.value = jsyaml.dump(parsedYaml, { indent: 2 });
                resultDiv.textContent = 'Valid YAML';
                resultDiv.className = 'success';
            } else if (action === 'minify') {
                textInput.value = jsyaml.dump(parsedYaml, { flowLevel: 0 });
                resultDiv.textContent = 'YAML Minified';
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
    validateButton.addEventListener('click', () => processYaml('validate'));
    minifyButton.addEventListener('click', () => processYaml('minify'));
    clearButton.addEventListener('click', clearAll);
    copyButton.addEventListener('click', copyContent);
    
    updateLineNumbers();
}