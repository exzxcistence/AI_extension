export function renderErrorPage() {
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