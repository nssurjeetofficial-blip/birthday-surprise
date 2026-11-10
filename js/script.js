
document.addEventListener("DOMContentLoaded", () => {

    // =================================
    // 1. ELEMENTS
    // =================================

    const birthdayForm = document.getElementById("birthdayForm");
    const nameInput = document.getElementById("girlName");
    const dateInput = document.getElementById("birthdayDate");

    let birthdayName = "";
    let birthdayDate = null;
    let countdownInterval = null;


    // =================================
    // 2. PAGE NAVIGATION
    // =================================

    window.showPage = function(pageId) {

        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        const selectedPage = document.getElementById(pageId);

        if (selectedPage) {
            selectedPage.classList.add("active");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };


    // =================================
    // 3. BIRTHDAY SETUP
    // =================================

    if (birthdayForm) {

        birthdayForm.addEventListener("submit", function(event) {

            event.preventDefault();

            birthdayName = nameInput.value.trim();

            const selectedDate = dateInput.value;

            if (!birthdayName || !selectedDate) {
                alert("Please enter her name and birthday date! 🎀");
                return;
            }

            const [year, month, day] = selectedDate.split("-").map(Number);

            // Birthday countdown uses the next occurrence
            const now = new Date();

            let nextBirthday = new Date(
                now.getFullYear(),
                month - 1,
                day,
                0, 0, 0
            );

            if (nextBirthday.getTime() <= now.getTime()) {
                nextBirthday.setFullYear(now.getFullYear() + 1);
            }

            birthdayDate = nextBirthday;

            // Show birthday girl's name
            document.querySelectorAll(".girl-name").forEach(element => {
                element.textContent = birthdayName;
            });

            startCountdown();

            showPage("cakePage");

        });

    }


    // =================================
    // 4. COUNTDOWN TIMER
    // =================================

    function startCountdown() {

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        function updateCountdown() {

            const now = new Date();
            const difference = birthdayDate - now;

            if (difference <= 0) {
                document.getElementById("days").textContent = "00";
                document.getElementById("hours").textContent = "00";
                document.getElementById("minutes").textContent = "00";
                document.getElementById("seconds").textContent = "00";
                return;
            }

            const days = Math.floor(difference / 86400000);
            const hours = Math.floor((difference / 3600000) % 24);
            const minutes = Math.floor((difference / 60000) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            document.getElementById("days").textContent =
                String(days).padStart(2, "0");

            document.getElementById("hours").textContent =
                String(hours).padStart(2, "0");

            document.getElementById("minutes").textContent =
                String(minutes).padStart(2, "0");

            document.getElementById("seconds").textContent =
                String(seconds).padStart(2, "0");

        }

        updateCountdown();

        countdownInterval = setInterval(updateCountdown, 1000);

    }


    // =================================
    // 5. FLOATING HEART ANIMATION
    // =================================

    const heartContainer = document.getElementById("backgroundHearts");

    function createHeart() {

        if (!heartContainer) return;

        const heart = document.createElement("span");

        heart.className = "heart";

        const hearts = ["♡", "♥", "💕", "💗", "✨"];

        heart.textContent =
            hearts[Math.floor(Math.random() * hearts.length)];

        heart.style.left = Math.random() * 100 + "%";

        heart.style.fontSize =
            (Math.random() * 16 + 12) + "px";

        heart.style.animationDuration =
            (Math.random() * 5 + 7) + "s";

        heartContainer.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 13000);

    }

    // Keep floating hearts limited for mobile performance
    for (let i = 0; i < 8; i++) {
        setTimeout(createHeart, i * 500);
    }

    setInterval(createHeart, 1200);


    // =================================
    // 6. PREVENT EMPTY FORM SUBMISSION
    // =================================

    const today = new Date();

    const localToday =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    dateInput.setAttribute("min", localToday);

    // =================================
    // 7. INTERACTIVE GIFT SURPRISE
    // =================================

    const giftButton = document.getElementById("giftButton");
    const giftMessage = document.getElementById("giftMessage");

    if (giftButton && giftMessage) {

        giftButton.addEventListener("click", function() {

            giftButton.style.animation = "none";

            giftButton.style.transform = "scale(1.4) rotate(15deg)";

            giftButton.textContent = "🎉";

            setTimeout(() => {

                giftButton.style.display = "none";

                giftMessage.hidden = false;

                giftMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                // Create celebration hearts
                for (let i = 0; i < 18; i++) {

                    const heart = document.createElement("span");

                    heart.textContent = ["💗", "💕", "✨", "🌸"][
                        Math.floor(Math.random() * 4)
                    ];

                    heart.style.position = "fixed";
                    heart.style.left = Math.random() * 90 + 5 + "%";
                    heart.style.top = "75%";
                    heart.style.fontSize = "25px";
                    heart.style.pointerEvents = "none";
                    heart.style.zIndex = "9999";

                    document.body.appendChild(heart);

                    heart.animate([
                        {
                            transform: "translateY(0) scale(0.5)",
                            opacity: 1
                        },
                        {
                            transform: `translateY(-${150 + Math.random() * 250}px) scale(1.4)`,
                            opacity: 0
                        }
                    ], {
                        duration: 1800,
                        easing: "ease-out"
                    });

                    setTimeout(() => heart.remove(), 1900);
                }

            }, 450);

        });

    }
    
});
              
