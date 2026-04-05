import browser from 'webextension-polyfill';
import { ISelectedSimplifiedItem } from '../types/SelectedNodesTypes';






const contentText = document.getElementById("contentText")
const LayoutPage = document.querySelector(".layout")




function renderHomePage(selectedText?: string) {
    return `
    <div class="mode-group">
      <button class="mode-btn" id="SelectedFullPage">📄 Вся страница</button>
      <button class="mode-btn active" id="SelectedText">✂️ Выделенный текст</button>
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
function render(content: string) {
    if (LayoutPage)
        LayoutPage.innerHTML = content;
}


browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }).then((res: string) => {
    if (res && contentText) {
        contentText.innerText = res
    }
})



LayoutPage?.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement

    switch (target.id) {
        case "settingsBtn":
            render(await renderSettingPage())
            break;
        case "backToMain":
            browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }).then((res: string) => render(renderHomePage(res)))
            render(renderHomePage())
            break;
        case "simplifyBtn":
            let { levelSelected } = await browser.storage.local.get("levelSelected")
            const SelectedText = await browser.runtime.sendMessage({ type: "GET_SELECTED_TEXT" })
            const SimplifiedItem = await browser.runtime.sendMessage({ type: "SIMPLIFY_TEXT", text: SelectedText, target: levelSelected }) as ISelectedSimplifiedItem
            const contentText = document.getElementById("contentText")
            if (!contentText) return
            contentText.innerText = SimplifiedItem.modifiedText
            break
        case "SelectedFullPage":
            const btnSelectedText = document.getElementById("SelectedText") as HTMLButtonElement
            if (!btnSelectedText) return
            btnSelectedText.classList.remove("active")
            target.classList.add("active")

            break
        case "SelectedText":
            const bntSelectedFullPage = document.getElementById("SelectedFullPage") as HTMLButtonElement
            if (!bntSelectedFullPage) return
            bntSelectedFullPage.classList.remove("active")
            target.classList.add("active")
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
