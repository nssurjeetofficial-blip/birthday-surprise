document.addEventListener("DOMContentLoaded", () => {

    // =================================
    // 1. ELEMENTS & VARIABLES
    // =================================

    const birthdayForm = document.getElementById("birthdayForm");
    const nameInput = document.getElementById("girlName");
    const dateInput = document.getElementById("birthdayDate");
    const customizeLink = document.getElementById("customizeLink");

    let birthdayName = "";
    let birthdayDate = null;
    let countdownInterval = null;

    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get("share");
    const isPublicPage = Boolean(shareToken);


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
    // 3. BIRTHDAY NAME & DATE
    // =================================

    function setBirthday(name, dateString) {

        birthdayName = name || "Birthday Girl";

        document.querySelectorAll(".girl-name").forEach(element => {
            element.textContent = birthdayName;
        });

        if (dateString) {
            const parts = dateString.split("-").map(Number);

            if (parts.length === 3 && parts.every(Number.isFinite)) {
                const today = new Date();

                let nextBirthday = new Date(
                    today.getFullYear(),
                    parts[1] - 1,
                    parts[2],
                    0, 0, 0
                );

                if (
                    nextBirthday.getMonth() !== parts[1] - 1 ||
                    nextBirthday.getDate() !== parts[2]
                ) {
                    return;
                }

                if (nextBirthday.getTime() < today.getTime()) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                birthdayDate = nextBirthday;
                startCountdown();
            }
        }
    }


    // =================================
    // 4. NORMAL BIRTHDAY SETUP
    // =================================

    if (birthdayForm) {

        birthdayForm.addEventListener("submit", event => {

            event.preventDefault();

            const name = nameInput.value.trim();
            const selectedDate = dateInput.value;

            if (!name || !selectedDate) {
                alert("Please enter her name and birthday date! 🎀");
                return;
            }

            setBirthday(name, selectedDate);
            showPage("cakePage");

        });
    }


    // =================================
    // 5. COUNTDOWN TIMER
    // =================================

    function startCountdown() {

        if (!birthdayDate) return;

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        function updateCountdown() {

            const now = new Date();
            const difference = birthdayDate - now;

            const daysElement = document.getElementById("days");
            const hoursElement = document.getElementById("hours");
            const minutesElement = document.getElementById("minutes");
            const secondsElement = document.getElementById("seconds");

            if (!daysElement || !hoursElement ||
                !minutesElement || !secondsElement) return;

            if (difference <= 0) {
                daysElement.textContent = "00";
                hoursElement.textContent = "00";
                minutesElement.textContent = "00";
                secondsElement.textContent = "00";
                clearInterval(countdownInterval);
                return;
            }

            const days = Math.floor(difference / 86400000);
            const hours = Math.floor((difference / 3600000) % 24);
            const minutes = Math.floor((difference / 60000) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            daysElement.textContent = String(days).padStart(2, "0");
            hoursElement.textContent = String(hours).padStart(2, "0");
            minutesElement.textContent = String(minutes).padStart(2, "0");
            secondsElement.textContent = String(seconds).padStart(2, "0");
        }

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }


    // =================================
    // 6. LOAD CLIENT'S BIRTHDAY CONTENT
    // =================================

    async function loadPublicBirthday() {

        if (!isPublicPage) return;

        // Hide customization and setup from girlfriend's link
        if (customizeLink) customizeLink.hidden = true;

        if (birthdayForm) {
            const setupPage = document.getElementById("setupPage");
            if (setupPage) setupPage.hidden = true;
        }

        const client = window.supabaseClient;

        if (!client) {
            showLoadError("Birthday page is temporarily unavailable. Please try again.");
            return;
        }

        try {

            const { data, error } = await client.rpc(
                "get_public_birthday_surprise",
                { p_token: shareToken }
            );

            if (error) throw error;

            if (!data || !data.birthday_name) {
                showLoadError("This birthday surprise is not available.");
                return;
            }

            // Load name and birthday date
            setBirthday(data.birthday_name, data.birthday_date);

            // Load editable messages
            setText("welcomeMessage", data.welcome_message);
            setText("aboutMessage", data.about_message);
            setText("wishesMessage", data.wishes_message);
            setText("giftText", data.gift_message);

            // Load personal letter
            const letter = document.getElementById("letterMessage");

            if (letter && data.personal_letter) {
                letter.textContent = data.personal_letter;
            }

            // Load uploaded photos
            await loadMemoryPhotos(data.photos, data.captions);

            // Start the birthday journey
            showPage("cakePage");

        } catch (error) {

            console.error("Birthday loading error:", error);

            showLoadError(
                "We couldn't load this birthday surprise. Please check the link or try again."
            );
        }
    }


    function setText(id, value) {

        const element = document.getElementById(id);

        if (element && typeof value === "string" && value.trim()) {
            element.textContent = value;
        }
    }


    function showLoadError(message) {

        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        const errorPage = document.createElement("section");

        errorPage.className = "page active";
        errorPage.style.display = "flex";
        errorPage.style.minHeight = "100vh";
        errorPage.style.alignItems = "center";
        errorPage.style.justifyContent = "center";
        errorPage.style.padding = "25px";
        errorPage.style.textAlign = "center";

        const heading = document.createElement("h2");
        heading.textContent = "🎀 Oops!";

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        errorPage.append(heading, paragraph);
        document.body.appendChild(errorPage);
    }


    // =================================
    // 7. CLIENT PHOTO GALLERY
    // =================================

    async function loadMemoryPhotos(photos, captions) {

        const grid = document.getElementById("memoryGrid");

        if (!grid || !photos || typeof photos !== "object") return;

        const entries = Object.entries(photos)
            .filter(([, path]) => typeof path === "string" && path.trim());

        if (!entries.length) return;

        const client = window.supabaseClient;
        const fragment = document.createDocumentFragment();

        for (const [key, path] of entries) {

            const { data, error } = await client
                .storage
                .from("birthday-photos")
                .createSignedUrl(path, 3600);

            if (error || !data?.signedUrl) {
                console.error("Photo loading error:", error);
                continue;
            }

            const item = document.createElement("div");
            item.className = "memory-item";

            const image = document.createElement("img");
            image.className = "memory-photo";
            image.src = data.signedUrl;
            image.alt = "Birthday memory";
            image.loading = "lazy";

            const caption = document.createElement("small");
            caption.textContent =
                captions && captions[key]
                    ? captions[key]
                    : "A beautiful memory 💗";

            item.append(image, caption);
            fragment.appendChild(item);
        }

        if (fragment.childNodes.length) {
            grid.replaceChildren(fragment);
        }
    }


    // =================================
    // 8. FLOATING HEART ANIMATION
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

        setTimeout(() => heart.remove(), 13000);
    }

    for (let i = 0; i < 8; i++) {
        setTimeout(createHeart, i * 500);
    }

    setInterval(createHeart, 1200);


    // =================================
    // 9. DATE INPUT MINIMUM
    // =================================

    if (dateInput) {

        const today = new Date();

        const localToday =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        dateInput.setAttribute("min", localToday);
    }


    // =================================
    // 10. INTERACTIVE GIFT SURPRISE
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


    // =================================
    // 11. START PUBLIC OR NORMAL MODE
    // =================================

    if (isPublicPage) {
        loadPublicBirthday();
    }

});
