class SelectedNodes {
    getSelectedNodes(): string | null {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        if (range.collapsed) return null;

        const clonedContents = range.cloneContents();


        const wrapper = document.createElement("span");
        wrapper.appendChild(clonedContents);



        return wrapper.innerText
    }
    getFullTextNodes() {
        const paragraphs = document.querySelectorAll('p');

        let extractedText = '';
        for (const p of paragraphs) {
            if (extractedText.length + p.innerText.length > 16000) break;
            extractedText += p.textContent + '\n';
        }

        return extractedText.trim();
    }
}

export default new SelectedNodes()