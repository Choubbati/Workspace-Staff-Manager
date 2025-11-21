let dataEmployer = [];
let add_btn = document.getElementById("btn-add");
let modal = document.getElementById("modal");
let selectedZone = null;
let editingIndex = null;

// Définition des zones
const allZones = ["reception", "serveurs", "securite", "personnel", "archives", "conference"];

// Règles par rôle
const roleZones = {
    "réceptionniste": ["réception"],
    "techniciens it": ["salle des serveurs"],
    "agent securite": ["salle de sécurité"],
    "manager": ["réception", "salle des serveurs", "salle de sécurité", "salle du personnel", "salle d'archives", "salle de conférence"],
    "nettoyage": ["réception", "salle des serveurs", "salle de sécurité", "salle du personnel", "salle de conférence"],
};


// Limitation des zones
const zoneLimits = {
    "reception": 1,
    "serveurs": 2,
    "securite": 2,
    "personnel": 4,
    "archives": 1,
    "conference": Infinity,
};

// Modal sélection
const modalSelect = document.createElement("div");
modalSelect.className = "modal-bg";
modalSelect.id = "modalSelect";
modalSelect.style.display = "none";
modalSelect.innerHTML = `
  <div class="modal" style="width:350px;">
      <span id="closeSelect" style="cursor:pointer;float:right;font-size:20px;">&times;</span>
      <h3>Choisir un employé</h3>
      <div id="selectList"></div>
  </div>
`;
document.body.appendChild(modalSelect);
document.getElementById("closeSelect").onclick = () => modalSelect.style.display = "none";

// DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
    dataEmployer = JSON.parse(localStorage.getItem("employer")) || [];
    renderDetails();

    // Input photo
    const input = document.getElementById("file");
    const photoModal = document.getElementById("photoModal");
    input.addEventListener("change", () => {
        if(input.files[0]) photoModal.src = URL.createObjectURL(input.files[0]);
    });

    // Add employee button
    add_btn.addEventListener('click', () => {
        editingIndex = null;
        modal.style.display = 'flex';
        document.getElementById("addForm").reset();
        photoModal.src = "";
    });

    // Experiences dynamic add/remove
    const containerExp = document.getElementById("experiencesContainer");
    const addExpBtn = document.getElementById("addExperienceBtn");
    addExpBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.classList.add("experience");
        div.innerHTML = `
          <input type="text" name="poste[]" placeholder="Poste">
          <input type="text" name="duree[]" placeholder="Durée">
          <button type="button" class="removeExperience">Supprimer</button>
        `;
        containerExp.appendChild(div);
    });
    containerExp.addEventListener("click", e => {
        if (e.target.classList.contains("removeExperience")) e.target.parentElement.remove();
    });

    // Form submit
    document.getElementById("addForm").addEventListener("submit", ajouterEmployer);
});

// Ajouter / Modifier employer
function ajouterEmployer(e) {
    e.preventDefault();

    const firstnameEl = document.getElementById("firstname");
    const roleEl = document.getElementById("role");
    const emailEl = document.getElementById("email");
    const teleEl = document.getElementById("tele");
    const photoEl = document.getElementById("photoModal");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{6,15}$/;

    [firstnameEl, roleEl, emailEl, teleEl].forEach(input => {
        input.style.border = "1px solid #ccc";
    });

    let valid = true;
    if (firstnameEl.value.trim() === "") { firstnameEl.style.border = "2px solid red"; valid = false; }
    if (roleEl.value.trim() === "") { roleEl.style.border = "2px solid red"; valid = false; }
    if (!emailRegex.test(emailEl.value.trim())) { emailEl.style.border = "2px solid red"; valid = false; }
    if (!phoneRegex.test(teleEl.value.trim())) { teleEl.style.border = "2px solid red"; valid = false; }
    if (!photoEl.src || photoEl.src === "") { alert("Veuillez ajouter une photo."); valid = false; }

    if (!valid) return;

    const firstname = firstnameEl.value.trim();
    const role = roleEl.value.trim();
    const email = emailEl.value.trim();
    const tele = teleEl.value.trim();
    const photo = photoEl.src;

    const roleLower = role.toLowerCase();
    const allowedZones = roleZones[roleLower] || [];

    if (editingIndex !== null) {

        // modifier un empl
        const emp = dataEmployer[editingIndex];
        emp.firstname = firstname;
        emp.role = role;
        emp.email = email;
        emp.tele = tele;
        emp.photo = photo;
        emp.allowedZones = allowedZones;
        editingIndex = null;
    } else {
        //ajouter un empl
        dataEmployer.push({ firstname, role, email, tele, photo, allowedZones });
    }

//save liste dans localstorage
    localStorage.setItem("employer", JSON.stringify(dataEmployer));

    renderDetails();

    document.getElementById("addForm").reset();
    photoEl.src = "";
    modal.style.display = "none";
}

// Render all employee cards
function renderDetails() {
    const list = document.getElementById("listCard");
    list.innerHTML = "";

    dataEmployer.forEach((emp, index) => {
        const div = document.createElement("div");
        div.classList.add("profil-card");
        div.dataset.index = index;
        div.dataset.assigned = "no";
        div.innerHTML = `
          <div class="img-profil">
              <img src="${emp.photo}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
          </div>
          <div class="role">
              <p>${emp.firstname}</p>
              <div class="role">${emp.role}</div>
          </div>
          <button class="btn-edit">Edit</button>
        `;
        list.appendChild(div);
    });

    attachButtons();
    prepareZoneButtons();
    cardDetails();
}

// Attach Edit/Remove buttons
function attachButtons() {
    document.querySelectorAll(".profil-card").forEach(card => {
        const btn = card.querySelector("button");
        if (card.dataset.assigned === "no") {
            btn.className = "btn-edit";
            btn.innerText = "Edit";
            btn.onclick = e => {
                e.stopPropagation();
                editingIndex = card.dataset.index;
                const emp = dataEmployer[editingIndex];
                document.getElementById("firstname").value = emp.firstname;
                document.getElementById("role").value = emp.role;
                document.getElementById("email").value = emp.email;
                document.getElementById("tele").value = emp.tele;
                document.getElementById("photoModal").src = emp.photo;
                modal.style.display = "flex";
            };
        } else {
            btn.className = "btn-remove";
            btn.innerText = "Remove";
            btn.onclick = e => {
                e.stopPropagation();
                card.dataset.assigned = "no";
                document.getElementById("listCard").appendChild(card);
                attachButtons();
            };
        }
    });
}

// Employee affiche modal
function cardDetails() {
    const cards = document.querySelectorAll(".profil-card");
    const previewModal = document.getElementById("modalPreview");
    const closeBtn = document.getElementById("closePreview");

    cards.forEach(card => {
        card.addEventListener("click", e => {
            if (e.target.classList.contains("btn-edit") || e.target.classList.contains("btn-remove")) return;
            const index = card.dataset.index;
            const emp = dataEmployer[index];
            document.getElementById("previewPhoto").src = emp.photo;
            document.getElementById("previewName").innerText = emp.firstname;
            document.getElementById("previewRole").innerText = emp.role;
            document.getElementById("previewEmail").innerText = emp.email;
            document.getElementById("previewTele").innerText = emp.tele;
            previewModal.style.display = "flex";
        });
    });

    closeBtn.addEventListener("click", () => previewModal.style.display = "none");
    previewModal.addEventListener("click", e => { if (e.target === previewModal) previewModal.style.display = "none"; });
}
function prepareZoneButtons() {
    const plusBtns = document.querySelectorAll(".add-worker-btn");
    
    plusBtns.forEach(btn => {
        btn.style.display = "inline-block"; 
        btn.onclick = () => {
            selectedZone = btn.closest("[data-zone]");
            if (!selectedZone) {
                alert("Erreur: zone non trouvée");
                return;
            }
            openSelectModal();
        };
    });
}
