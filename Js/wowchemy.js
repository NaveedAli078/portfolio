// script.js

document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".project-toolbar a");

    filterButtons.forEach((button) => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent the page from scrolling to the top
            
            // Remove active class from all buttons
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            
            // Add active class to the clicked button
            this.classList.add("active");

            // Get the filter class from the clicked button
            const filterValue = this.getAttribute("data-filter");

            // Filter the project items
            const projectItems = document.querySelectorAll(".project-card");
            projectItems.forEach((item) => {
                if (filterValue === "*" || item.classList.contains(filterValue.substring(1))) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
});
