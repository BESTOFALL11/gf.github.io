document.addEventListener('DOMContentLoaded', () => {
    const heartsContainer = document.querySelector('.hearts-container');
    const specialMessageContainer = document.getElementById('special-message-container');
    const specialMessage = document.getElementById('special-message');
    const numberOfHearts = 15; // Number of falling hearts

    // Track the last clicked element
    let lastClickedElement = null;
    let lastMessage = '';

    // Easter egg counter
    let easterEggsFound = 0;
    const totalEasterEggs = document.querySelectorAll('.easter-egg, .hidden-easter-egg, .flower-easter-egg').length;

    // Function to toggle message
    function toggleMessage(element, message) {
        if (lastClickedElement === element && !specialMessageContainer.classList.contains('hidden')) {
            // If clicking the same element and message is visible, hide it
            specialMessageContainer.classList.add('hidden');
            lastClickedElement = null;
        } else {
            // Show new message
            specialMessage.textContent = message;
            specialMessageContainer.classList.remove('hidden');
            lastClickedElement = element;
            lastMessage = message;
        }
    }

    // Handle easter eggs
    document.querySelectorAll('.easter-egg, .hidden-easter-egg, .flower-easter-egg').forEach(egg => {
        egg.addEventListener('click', () => {
            const message = egg.getAttribute('data-message');
            toggleMessage(egg, message);
            
            // Animate the easter egg
            egg.style.transform = 'scale(1.2)';
            setTimeout(() => {
                egg.style.transform = '';
            }, 300);

            // Count found easter eggs
            if (!egg.classList.contains('found')) {
                easterEggsFound++;
                egg.classList.add('found');
                
                // Special message when all easter eggs are found
                if (easterEggsFound === totalEasterEggs) {
                    setTimeout(() => {
                        toggleMessage(egg, "You found all the secrets! You're amazing! 💖");
                    }, 1000);
                }
            }
        });
    });

    const cuteMessages = [
        "You make my heart skip a beat!",
        "Every moment with you is a treasure.",
        "To the moon and back, my love!",
        "Eight months of pure happiness!",
        "My favorite love story is ours.",
        "You are my sunshine on a cloudy day.",
        "I love you more than words can say!",
        "You're my favorite hello and my hardest goodbye.",
        "Every day with you is a blessing.",
        "You're the reason I smile every day.",
        "My heart belongs to you.",
        "You're my everything.",
        "Forever and always, my love.",
        "You make my world complete.",
        "I'm so lucky to have you."
    ];

    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');

        // Random horizontal position
        heart.style.left = Math.random() * 100 + '%';
        // Random animation delay for a staggered effect
        heart.style.animationDelay = Math.random() * 5 + 's';
        // More consistent size range
        const randomSize = Math.random() * 8 + 16; // Size between 16px and 24px
        heart.style.width = randomSize + 'px';
        heart.style.height = randomSize + 'px';
        
        // Update the pseudo-elements to match the heart size
        heart.style.setProperty('--heart-size', randomSize + 'px');
        heart.style.setProperty('--heart-half', (randomSize / 2) + 'px');

        // Assign a random message to this specific heart
        const randomIndex = Math.floor(Math.random() * cuteMessages.length);
        const heartMessage = cuteMessages[randomIndex];
        // Remove the used message to avoid repetition
        cuteMessages.splice(randomIndex, 1);

        heart.addEventListener('click', () => {
            toggleMessage(heart, heartMessage);
            
            // Smoother click animation
            heart.style.transform = 'rotate(-45deg) scale(1.3)';
            heart.style.transition = 'transform 0.3s ease-out';
            setTimeout(() => {
                heart.style.transform = 'rotate(-45deg) scale(1)';
            }, 300);
        });

        heartsContainer.appendChild(heart);

        // Remove heart from DOM after it falls
        heart.addEventListener('animationend', () => {
            if (heart.offsetTop > window.innerHeight) {
                heart.remove();
            }
        });
    }

    // Create initial hearts
    for (let i = 0; i < numberOfHearts; i++) {
        createHeart();
    }

    // Create new hearts periodically to replace those that fall off
    setInterval(() => {
        if (heartsContainer.children.length < numberOfHearts && cuteMessages.length > 0) {
            createHeart();
        }
    }, 2000); // Check every 2 seconds
}); 