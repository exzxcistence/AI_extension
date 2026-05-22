export async function renderSettingPage(levelSelected: string) {
    return `
    <div class="settings-header">
            <h3>
                Уровни упрощения
            </h3>
        </div>

        <div class="simplify-levels">
            <button class="level-btn ${levelSelected == "ADAPT_LIGHT_PROMPT" && "active"}" id="ADAPT_LIGHT_PROMPT">
                <div class="level-title">
                    Простое упрощение
                    <div class="level-desc">Объясни как пятикласснику</div>
                </div>
            </button>

            <button class="level-btn ${levelSelected == "ADAPT_MEDIUM_PROMPT" && "active"}" id="ADAPT_MEDIUM_PROMPT">
                <div class="level-title">
                    Среднее упрощение
                    <div class="level-desc">Упрости до базового уровня</div>
                </div>
            </button>

            <button class="level-btn ${levelSelected == "ADAPT_MAX_PROMPT" && "active"}" id="ADAPT_MAX_PROMPT">
                <div class="level-title">
                    Максимальное упрощение
                    <div class="level-desc">Сохрани суть, убери термины</div>
                </div>
            </button>
        </div>

        <button class="back-btn" id="backToMain">
            На главную
        </button>
    `
}