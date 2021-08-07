let to = "Todos";
let visibility = "Público";
let username;

function toggleNav(action) {
    document.querySelector(".background").classList.toggle("hidden");
    if (!action) {
        document.querySelector("aside").style.width = "0";
        return;
    }
    document.querySelector("aside").style.width = "260px";
}

function setName() {
    username = document.querySelector("section input").value;
    if (isNaN(username)) document.querySelector("section").classList.add("hidden");
}

function changeContact(select) {
    document.querySelector(".contact .select").classList.toggle("select");
    select.querySelector(".check").classList.toggle("select");
    to = select.querySelector("p").innerHTML;
    checkChanges();
}

function changeVisibility(select) {
    document.querySelector(".visibility .select").classList.toggle("select");
    select.querySelector(".check").classList.toggle("select");
    visibility = select.querySelector("p").innerHTML;
    checkChanges();
}

function checkChanges() {
    let select = document.querySelector("footer .container p");
    if (to !== "Todos") {
        select.innerHTML = `Enviando para ${to} (${visibility})`;
        return;
    }
    select.innerHTML = "";
}


