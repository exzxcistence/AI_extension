import browser from 'webextension-polyfill';
import ai from '../Service/ai';
import getID from '../helpers/getId';


browser.runtime.onMessage.addListener(async (req) => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tabs) {
        return { error: "" }
    }
    switch (req.type) {
        case "GET_SELECTED_TEXT":
            const selectedText = await browser.tabs.sendMessage(
                tabs[0].id!,
                { type: "GET_SELECTED_TEXT" }
            );

            return selectedText
            break;
        case "GET_FULLTEXT_PAGE":
            const fullTextPage = await browser.tabs.sendMessage(
                tabs[0].id!,
                { type: "GET_FULLTEXT_PAGE" }
            );

            return fullTextPage
            break;
        case "SIMPLIFY_TEXT":
            const text = await ai.SimplificationText(req.text, req.target)
            const id = getID()
            return {
                id,
                originalText: req.text,
                modifiedText: text
            }
            break
        default:
            break;
    }
})