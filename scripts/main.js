let to, visibility, username;

const participantsAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants";
const messagesAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages";
const statusAPI = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status";

const loginSection = document.querySelector("section");
const messageMain = document.querySelector("main ul");
const asideContacts = document.querySelector(".contacts");
const asidePublic = document.querySelector(".public");
const messageInput = document.querySelector(".input-msg");

const originalLoginSection = loginSection.querySelector(".box").innerHTML;


/*                                 User Functions                               */
function setName() {
    username = loginSection.querySelector("input").value;
    if (!isNaN(username)) return;
    
    loginSection.querySelector(".box").innerHTML = `
    <img src="assets/loading.gif" alt="Carregando">
    <h1>Entrando...</h1>`
    
    const promise = axios.post(participantsAPI, {"name":username});
    promise.catch(e => {
        loginSection.querySelector(".box").innerHTML = originalLoginSection;
        loginSection.querySelector("p").innerHTML = `Erro - ${e.response.data} <br> Nome de usuário já utilizado!`
    });
    promise.then(() => {
        userLoggedIn();
    });
}

function checkUserOn() {
    if (document.visibilityState === "visible") {
        axios.post(statusAPI, {name:username}).catch(e => {
            alert("Erro ao atualizar status do usuário." + e.response.data);
        });
    } else {
        userLoggedOut(); //Não fiz com window.reload porque queria que mostrasse a mensagem: "Você saiu da sala", acredito que não seja problema, porque era uma recomendação
    }
}

function userLoggedIn() {
    loginSection.style.opacity = "0"; //Somente para transição
    setTimeout(() => {loginSection.classList.add("hidden");}, 800); 
    checkUserOn();
    getMessages();
    getParticipants();
    changeContact(asideContacts.firstElementChild);
    timerCheckUserOn = setInterval(checkUserOn, 5000);
    timerNewMessages = setInterval(getNewMessages, 3000);
    timerGetParticipants = setInterval(getParticipants, 10000);
}

function userLoggedOut() {
    clearInterval(timerCheckUserOn);
    clearInterval(timerNewMessages);
    clearInterval(timerGetParticipants);
    loginSection.classList.remove("hidden");
    loginSection.style.opacity = "1";
    loginSection.querySelector(".box").innerHTML = originalLoginSection;
    loginSection.querySelector("p").innerHTML = `Você saiu da sala.`;
    loginSection.querySelector("input").value = username;
    messageInput.value = "";
}

/*                                 Message Functions                               */
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

function sendMessage() {
    const msg = {
        from: username,
        to: to,
        text: messageInput.value,
        type: (visibility === "Público" || to === "Todos") ? "message" : "private_message"
    }
    
    messageInput.value = "";
    axios.post(messagesAPI, msg).then(() => {
        clearInterval(timerNewMessages); //Para evitar que a getNewMessages() chamada periodicamente encontre a chamada abaixo no meio da requisição e duplique a msg
        getNewMessages(); //Para ter dinamicidade ao enviar a msg
        timerNewMessages = setInterval(getNewMessages, 3000);
    });
}

document.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

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
    if (asideContacts.querySelector(".select") !== null) asideContacts.querySelector(".select").classList.toggle("select");
    
    select.querySelector(".check").classList.toggle("select");
    to = select.id;
    if (to === "Todos") changeVisibility(asidePublic);
    updateAsideChanges();  
}

function changeVisibility(select) {
    if (to === "Todos" && visibility === "Público") return;
    
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

function getParticipants() {
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
        hasContactSelected();
    });
}

function hasContactSelected() {
    if (asideContacts.querySelector(".select") === null) { //Caso o contato selecionado saia do chat
        changeContact(asideContacts.firstElementChild);
    }
    updateAsideChanges();
}
