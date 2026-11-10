$(document).ready(() => {
    const updateButtonLabel = () => {
        const nearestButton = $('button.btn-consent').first();
        
        if (nearestButton.length) {
            const buttonText = nearestButton.text();
            const lowercaseText = buttonText.toLowerCase();
            $('.tcpa-button-label').text(lowercaseText);
        }
    };

    updateButtonLabel();
});
