var tab = document.getElementById("userTab");
    
tab.addEventListener("click", function() {
    this.classList.toggle("showing");
    var base = this.nextElementSibling;
    if (base.style.display === "flex") {
        base.style.display = "none";
    } else {
        base.style.display = "flex";
    }
})