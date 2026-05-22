export async function renderHomePage(SelectedType: string, selectedText?: string) {
    return `
    <div class="mode-group" id="SelectedTypeGroup">
      <button class="mode-btn ${SelectedType == "SelectedFullPage" && "active"}" id="SelectedFullPage">Вся страница</button>
      <button class="mode-btn ${SelectedType == "SelectedText" && "active"}" id="SelectedText">Выделенный текст</button>
    </div>

    <div class="content">
      <div class="content-text" id="contentText">
        ${selectedText ? selectedText : '<span class="content-placeholder">Выделите текст на странице, и он появится здесь</span>'}
      </div>
    </div>
    
    <div class="action-group">
      <button class="action-btn simplify-btn" id="simplifyBtn">
        Упростить
      </button>
      <button class="action-btn settings-btn" id="settingsBtn">
        Настройки
      </button>
    </div>
    `
}