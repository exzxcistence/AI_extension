import browser from 'webextension-polyfill';
import SelectedNodes from '../Service/SelectedNodes';

browser.runtime.onMessage.addListener(async (req) => {

    if (req.type == "GET_SELECTED_TEXT") {
        return SelectedNodes.getSelectedNodes()
    }else if(req.type == "GET_FULLTEXT_PAGE"){
        return SelectedNodes.getFullTextNodes()
    }
});