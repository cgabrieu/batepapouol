let to = "Todos", visibility = "Público", username, participants = [];
const participantsAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants";

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
    if (!isNaN(username)) return;

    const promise = axios.post(participantsAPI, {"name":username});
    promise.catch(e => {
        document.querySelector("section p").innerHTML = `Erro - ${e.response.data} <br> Nome de usuário já utilizado!`
    });
    promise.then(() => {
        const section = document.querySelector("section");
        section.style.opacity = "0"; //Somente para animação
        setTimeout(() => {
            document.querySelector("section").classList.add("hidden");
        }, 800);
        getParticipants();
    });
}

function getParticipants() {
    const promise = axios.get(participantsAPI);

    promise.catch(e => {
        alert("Erro ao obter participantes da conversa. " + e.response.data)
    });
    promise.then(s => {
        s.data.forEach(e => {
            if (e.name !== username)
                document.querySelector(".contacts").innerHTML += 
                `<div class="contact" onclick="changeContact(this)">
                    <div class="container">
                        <ion-icon name="person-circle"></ion-icon>
                        <p>${e.name}</p>
                    </div>
                    <ion-icon class="check" name="checkmark"></ion-icon>
                </div>`
        });
    });
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
    let select = document.querySelector("footer p");
    if (to !== "Todos") {
        select.innerHTML = `Enviando para ${to} (${visibility})`;
        return;
    }
    select.innerHTML = "";
}


