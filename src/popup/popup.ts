import browser from 'webextension-polyfill';
import { ISelectedSimplifiedItem } from '../types/SelectedNodesTypes';
import { renderHomePage } from './Components/HomePage';
import { renderErrorPage } from './Components/ErrorPage';
import { renderSettingPage } from './Components/SettingPage';
import { renderProloader } from './Components/Preloader';
import { renderSimplifyPage } from './Components/SimplifyPage';

const LayoutPage = document.querySelector(".layout")


document.addEventListener('DOMContentLoaded', async () => {
    let { SelectedType } = await browser.storage.local.get("SelectedType")
    if (!SelectedType) SelectedType = "SelectedText"
    if (SelectedType == "SelectedText") {
        browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }).then(async (selectedText: string) => {
            render(await renderHomePage(SelectedType, selectedText))
        })
    } else {
        browser.runtime.sendMessage({ type: "GET_FULLTEXT_PAGE" }).then(async (selectedText: string) => {
            render(await renderHomePage(SelectedType, selectedText))
        })
    }
});

function render(content: string) {
    if (LayoutPage)
        LayoutPage.innerHTML = content;
}


LayoutPage?.addEventListener("click", async (event) => {
    const target = event.target as HTMLButtonElement
    const contentText = document.getElementById("contentText")

    switch (target.id) {
        case "settingsBtn":
            let { levelSelected } = await browser.storage.local.get("levelSelected")
            if (!levelSelected) levelSelected = "ADAPT_LIGHT_PROMPT"
            render(await renderSettingPage(levelSelected))
            break;
        case "backToMain":
            browser.storage.local.get("SelectedType").then(res => {
                if (res.SelectedType == "SelectedFullPage") {
                    return browser.runtime.sendMessage({ type: "GET_FULLTEXT_PAGE" }).then(async (res: string) => render(await renderHomePage("SelectedFullPage", res)))
                }
            })
            browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }).then(async (res: string) => render(await renderHomePage("SelectedText", res)))
            break;
        case "simplifyBtn":
            render(renderProloader())
            try {
                let { levelSelected } = await browser.storage.local.get("levelSelected")
                let { SelectedType } = await browser.storage.local.get("SelectedType")
                let content = await browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" });

                if (SelectedType == "SelectedFullPage") {
                    content = await browser.runtime.sendMessage({ type: "GET_FULLTEXT_PAGE" });
                }

                if (!content) throw new Error()

                const SimplifiedItem = await browser.runtime.sendMessage({ type: "SIMPLIFY_TEXT", text: content, target: levelSelected }) as ISelectedSimplifiedItem
                await browser.storage.local.set({ originalText: SimplifiedItem.originalText, modifiedText: SimplifiedItem.modifiedText })

                render(renderSimplifyPage(SimplifiedItem.modifiedText))
            } catch (error) {
                render(renderErrorPage())
            }
            break
        case "returnOriginalTextbtn":
            const { originalText } = await browser.storage.local.get("originalText")

            render(renderSimplifyPage(originalText))
            document.getElementById("SimplifyTextbtn")?.classList.remove("active")
            document.getElementById("returnOriginalTextbtn")?.classList.add("active")

            break
        case "SimplifyTextbtn":
            const { modifiedText } = await browser.storage.local.get("modifiedText")

            render(renderSimplifyPage(modifiedText))
            document.getElementById("returnOriginalTextbtn")?.classList.remove("active")
            target.classList.add("active")
            break
        case "SelectedFullPage":
            await browser.storage.local.set({ SelectedType: "SelectedFullPage" })
            const btnSelectedText = document.getElementById("SelectedText") as HTMLButtonElement
            if (!btnSelectedText || !contentText) return
            btnSelectedText.classList.remove("active")
            target.classList.add("active")

            const fullTextPage = await browser.runtime.sendMessage({ type: "GET_FULLTEXT_PAGE" })
            contentText.innerText = fullTextPage
            break
        case "SelectedText":
            await browser.storage.local.set({ SelectedType: "SelectedText" })
            const bntSelectedFullPage = document.getElementById("SelectedFullPage") as HTMLButtonElement
            if (!bntSelectedFullPage || !contentText) return
            bntSelectedFullPage.classList.remove("active")
            target.classList.add("active")

            const selected = await browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" })
            selected ? contentText.innerText = selected : contentText.innerHTML = '<span class="content-placeholder">Выделите текст на странице, и он появится здесь</span>'

            break
        default:
            const button = target.closest('button');
            if (button) {
                if (button.id !== "ADAPT_LIGHT_PROMPT" && button.id !== "ADAPT_MEDIUM_PROMPT" && button.id !== "ADAPT_MAX_PROMPT") return;
                const level = button.id
                button.classList.add("active")
                document.querySelectorAll(".level-btn").forEach(btn => {
                    if (btn.id != level) btn.classList.remove("active")
                });
                await browser.storage.local.set({ levelSelected: level })
            }
            break;
    }

})

