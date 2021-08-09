let to, visibility, username;

const participantsAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants";
const messagesAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages";
const statusAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status";

const loginSection = document.querySelector("section");
const messageMain = document.querySelector("main ul");
const asideContacts = document.querySelector(".contacts");

const originalLoginSection = loginSection.querySelector(".box").innerHTML;

/*                                                                */

function setName() {
    username = loginSection.querySelector("input").value;
    if (!isNaN(username)) return;

    loginSection.querySelector(".box").innerHTML = `
        <img src="assets/loading.gif" alt="Carregando">
        <h1>Entrando...</h1>`

    axios.post(participantsAPI, {"name":username}).catch(e => {
        loginSection.querySelector("p").innerHTML = `Erro - ${e.response.data} <br> Nome de usuário já utilizado!`
    }).then(() => {
        loginSection.style.opacity = "0"; //Somente para transição
        setTimeout(() => {loginSection.classList.add("hidden");}, 800); 
        checkUserOn();
        getMessages();
        getParticipants();
        to = "Todos";
        visibility = "Público";
        timerCheckUserOn = setInterval(checkUserOn, 5000);
        timerNewMessages = setInterval(getNewMessages, 3000);
        timerGetParticipants = setInterval(getParticipants, 10000);
        timerHasSelected = setInterval(hasSelected, 200);
    });
}

function getParticipants() {
    hasSelected();
    axios.get(participantsAPI).catch(e => {
        alert("Erro ao obter participantes da conversa. " + e.response.data);
    }).then(s => {
        asideContacts.querySelector(".new-contacts").innerHTML = "";
        s.data.forEach(e => {
            if (e.name !== username)
            asideContacts.querySelector(".new-contacts").innerHTML += 
                `<div class="contact" id="${e.name}" onclick="changeContact(this)">
                    <div class="container">
                        <ion-icon name="person-circle"></ion-icon>
                        <p>${e.name}</p>
                    </div>
                    <ion-icon class="check ${(to === e.name) ? "select" : ""}" name="checkmark"></ion-icon>
                </div>`
        });
    });
}

function hasSelected() {
    if (asideContacts.querySelector(".select") === null) { //Caso o contato selecionado saia do chat
        asideContacts.firstElementChild.querySelector(".check").classList.add("select");
        to = "Todos";
    }
    updateAsideChanges();
}

function getMessages() {
    axios.get(messagesAPI).then(resp => {    
        drawMessages(resp.data);
    }); 
}

function getNewMessages() {
    const lastTime = messageMain.lastChild.querySelector("time").innerHTML.replace("(","").replace(")","");
    axios.get(messagesAPI).then(resp => {
        resp.data.forEach(e => {
            const currentTime =  (e.time).replace("(","").replace(")","");
            if (currentTime > lastTime) drawMessages([e]);
        });
    });
}

function drawMessages(msg) {
    msg.forEach(e => {
        if (e.type === "status") {
            messageMain.innerHTML += 
            `<li class="${e.type}"><time>(${e.time})</time> <strong>${e.from}</strong> ${e.text}</li>`;
        } else if (e.type === "message") {
            messageMain.innerHTML +=
            `<li class="${e.type}"><time>(${e.time})</time> <strong>${e.from}</strong> para <strong>${e.to}</strong>: ${e.text}</li>`;
        } else {
            if (username === e.to || username === e.from) messageMain.innerHTML +=
            `<li class="${e.type}"><time>(${e.time})</time> <strong>${e.from}</strong> reservadamente para <strong>${e.to}</strong>: ${e.text}</li>`;
        }
    });
    window.scrollTo(0,document.body.scrollHeight);
}

function checkUserOn() {
    if (document.visibilityState === "visible") {
        axios.post(statusAPI, {"name":username}).catch(e => {
            alert("Erro ao atualizar status do usuário." + e.response.data);
        });
    } else {
        clearInterval(timerCheckUserOn);
        clearInterval(timerNewMessages);
        clearInterval(timerGetParticipants);
        loginSection.classList.remove("hidden");
        loginSection.style.opacity = "1";
        loginSection.querySelector(".box").innerHTML = originalLoginSection;
        loginSection.querySelector("p").innerHTML = `Você saiu da sala.`;
    }
}


/*                            Collapsed asidebar                          */

function toggleAside(action) {
    document.querySelector(".background").classList.toggle("hidden");
    if (!action) {
        document.querySelector("aside").style.width = "0";
        return;
    }
    document.querySelector("aside").style.width = "260px";
}

function changeContact(select) {
    document.querySelector(".contact .select").classList.toggle("select");
    select.querySelector(".check").classList.toggle("select");    
    to = select.id;
    updateAsideChanges();
}

function changeVisibility(select) {
    document.querySelector(".visibility .select").classList.toggle("select");
    select.querySelector(".check").classList.toggle("select");
    visibility = select.querySelector("p").innerHTML;
    updateAsideChanges();
}

function updateAsideChanges() {
    const sendToInfo = document.querySelector("footer p");
    if (to !== "Todos") {
        sendToInfo.innerHTML = `Enviando para ${to} (${visibility})`;
        return;
    }
    sendToInfo.innerHTML = "";
}


