export function renderSimplifyPage(contentText: string) {
    return `
        <div class="mode-group">
            <button class="mode-btn" id="returnOriginalTextbtn">Оригинал</button>
            <button class="mode-btn active" id="SimplifyTextbtn">Упрощённый</button>
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