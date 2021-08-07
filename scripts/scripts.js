let to = "Todos", visibility = "Público", username, timerCheckStatus;
const participantsAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants";
const loginSection = document.querySelector("section")

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
        loginSection.style.opacity = "0"; //Somente para animação
        setTimeout(() => {
            document.querySelector("section").classList.add("hidden");
        }, 800);
        getParticipants();
    });
}

function getParticipants() {
    const promise = axios.get(participantsAPI);

    promise.catch(e => {
        alert("Erro ao obter participantes da conversa. " + e.response.data);
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
        timerCheckStatus = setInterval(checkStatus, 5000);
        getMsgs();
    });
}

function getMessage() {
    const promise = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages");
    promise.then(s => {
        s.data.forEach(e => {
            if (e.type === "status") {
                document.querySelector("main ul").innerHTML += 
                `<li class="${e.type}"><time>(${e.time})</time> <strong>${e.from}</strong> ${e.text}</li>`;
            } else if (e.type === "message") {
                document.querySelector("main ul").innerHTML +=
                `<li class="${e.type}"><time>(${e.time})</time> <strong>${e.from}</strong> para <strong>${e.to}</strong>: ${e.text}</li>`;
            } else {
                `<li class="${e.type}"><time>(${e.time})</time> <strong>${e.from}</strong> reservadamente para <strong>${e.to}</strong>: ${e.text}</li>`;
            }
        });
    });
}


function checkStatus() {
    if (document.visibilityState === "visible") {
        const promise = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status", {"name":username});
        promise.catch(e => {
            alert("Erro ao atualizar status do usuário." + e.response.data);
        });
    } else {
        clearInterval(timerCheckStatus);
        loginSection.classList.remove("hidden");
        loginSection.style.opacity = "1";
        document.querySelector("section p").innerHTML = `Você saiu da sala.`;
    }
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


