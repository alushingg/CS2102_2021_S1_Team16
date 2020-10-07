var backToTopButton = document.getElementById("bttButton");

window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
}

function returnToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}