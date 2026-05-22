import browser from 'webextension-polyfill';
import SelectedNodes from '../Service/SelectedNodes';

browser.runtime.onMessage.addListener(async (req) => {

    if (req.type == "GET_SELECTED_TEXT") {
        return SelectedNodes.getSelectedNodes()
    }else if(req.type == "GET_FULLTEXT_PAGE"){
        return SelectedNodes.getFullTextNodes()
    }
});

document.addEventListener("keydown", async (e) => {
    let text = null;
    let type = "";
    let originalText = null;

    if (e.shiftKey && e.key === "Q") {
        text = SelectedNodes.getSelectedNodes();
        type = "SELECTED_TEXT";
    }
    
    if (e.shiftKey && e.key === "W") {
        text = SelectedNodes.getFullTextNodes();
        type = "FULL_PAGE";
    }

    if (text && type) {
        const response = await browser.runtime.sendMessage({
            type: "KEYBOARD_SIMPLIFY",
            text: text,
            sourceType: type
        });
        
        await browser.runtime.sendMessage({
            type: "SHOW_RESULT",
            result: response
        });
    }
});