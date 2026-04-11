import browser from 'webextension-polyfill';
import { ISelectedSimplifiedItem } from '../types/SelectedNodesTypes';

const LayoutPage = document.querySelector(".layout")

document.addEventListener('DOMContentLoaded', async () => {
    let { SelectedType } = await browser.storage.local.get("SelectedType")
    if (!SelectedType) SelectedType = "SelectedText"

    if (SelectedType == "SelectedText") {
        browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }).then(async (selectedText: string) => {
            render(await renderHomePage(selectedText))
        })
    } else {
        browser.runtime.sendMessage({ type: "GET_FULLTEXT_PAGE" }).then(async (selectedText: string) => {
            render(await renderHomePage(selectedText))
        })
    }
});

function renderErrorPage() {
    return `
        <div class="error-container" id="errorContainer">
            <div class="error-icon">⚠️</div>
            <h3 class="error-title">Ошибка</h3>
            <p class="error-message" id="errorMessage">Не удалось упростить текст. Попробуйте ещё раз.</p>
            <button class="error-back-btn" id="backToMain">
                ← Вернуться в меню
            </button>
        </div>
    `
}

function renderProloader() {
    return `
        <div class="preloader">
            <div class="spinner"></div>
        </div>
    `
}

async function renderHomePage(selectedText?: string) {
    let { SelectedType } = await browser.storage.local.get("SelectedType")
    if (!SelectedType) SelectedType = "SelectedText"

    return `
    <div class="mode-group" id="SelectedTypeGroup">
      <button class="mode-btn ${SelectedType == "SelectedFullPage" && "active"}" id="SelectedFullPage">📄 Вся страница</button>
      <button class="mode-btn ${SelectedType == "SelectedText" && "active"}" id="SelectedText">✂️ Выделенный текст</button>
    </div>

    <div class="content">
      <div class="content-text" id="contentText">
        ${selectedText ? selectedText : '<span class="content-placeholder">Выделите текст на странице, и он появится здесь</span>'}
      </div>
    </div>
    
    <div class="action-group">
      <button class="action-btn simplify-btn" id="simplifyBtn">
        ✨ Упростить
      </button>
      <button class="action-btn settings-btn" id="settingsBtn">
        ⚙️ Настройки
      </button>
    </div>
    `
}
async function renderSettingPage() {
    let { levelSelected } = await browser.storage.local.get("levelSelected")
    if (!levelSelected) levelSelected = "ADAPT_LIGHT_PROMPT"
    return `
    <div class="settings-header">
            <h3>
                <span>⚙️</span> Уровни упрощения
            </h3>
        </div>

        <div class="simplify-levels">
            <button class="level-btn ${levelSelected == "ADAPT_LIGHT_PROMPT" && "active"}" id="ADAPT_LIGHT_PROMPT">
                <span class="level-emoji">📖</span>
                <div class="level-title">
                    Простое упрощение
                    <div class="level-desc">Объясни как пятикласснику</div>
                </div>
            </button>

            <button class="level-btn ${levelSelected == "ADAPT_MEDIUM_PROMPT" && "active"}" id="ADAPT_MEDIUM_PROMPT">
                <span class="level-emoji">🎓</span>
                <div class="level-title">
                    Среднее упрощение
                    <div class="level-desc">Упрости до базового уровня</div>
                </div>
            </button>

            <button class="level-btn ${levelSelected == "ADAPT_MAX_PROMPT" && "active"}" id="ADAPT_MAX_PROMPT">
                <span class="level-emoji">⚡</span>
                <div class="level-title">
                    Максимальное упрощение
                    <div class="level-desc">Сохрани суть, убери термины</div>
                </div>
            </button>
        </div>

        <button class="back-btn" id="backToMain">
            ← На главную
        </button>
    `
}

function renderSimplifyPage(contentText: string) {
    return `
        <div class="mode-group">
            <button class="mode-btn" id="returnOriginalTextbtn">📄 Оригинал</button>
            <button class="mode-btn active" id="SimplifyTextbtn">✨ Упрощённый</button>
        </div>

        <div class="content">
            <div class="content-text" id="contentText">
                ${contentText}
            </div>
        </div>
            
        <div class="action-group">
            <button class="action-btn simplify-btn" id="backToMain">
               ← На главную
            </button>
        </div>
    `
}

function render(content: string) {
    if (LayoutPage)
        LayoutPage.innerHTML = content;
}


LayoutPage?.addEventListener("click", async (event) => {
    const target = event.target as HTMLButtonElement
    const contentText = document.getElementById("contentText")

    switch (target.id) {
        case "settingsBtn":
            render(await renderSettingPage())
            break;
        case "backToMain":
            browser.storage.local.get("SelectedType").then(res => {
                if (res.SelectedType == "SelectedFullPage") {
                    return browser.runtime.sendMessage({ type: "GET_FULLTEXT_PAGE" }).then(async (res: string) => render(await renderHomePage(res)))
                }
            })
            browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }).then(async (res: string) => render(await renderHomePage(res)))
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

