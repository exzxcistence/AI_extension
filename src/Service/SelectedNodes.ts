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
        const listElem = document.querySelectorAll('li');

        let extractedText = '';
        paragraphs.forEach(p => {
            extractedText += p.textContent + '\n\n';
        });
        listElem.forEach(li => {
            extractedText += li.textContent + '\n\n';
        });

        return extractedText.trim();
    }
}

export default new SelectedNodes()