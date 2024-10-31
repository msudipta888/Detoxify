document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", newTheme);

        // Toggle icon based on theme
        if (newTheme === "dark") {
            themeIcon.className = "fa-solid fa-sun";
        } else {
            themeIcon.className ="fa-solid fa-moon" ;
        }
    });
});
