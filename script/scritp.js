let dataEmployer = [];
let add_btn = document.getElementById("btn-add");
let modal = document.getElementById("modal");
let selectedZone = null;
let editingIndex = null; // index de l'employé en édition

// Définition des zones
const allZones = [
    "réception",
    "salle des serveurs",
    "salle de sécurité",
    "salle du personnel",
    "salle d'archives",
    "salle de conférence"
];

// Règles par rôle
const roleZones = {
    "réceptionniste": ["réception"],
    "techniciens it": ["salle des serveurs"],
    "agents de sécurité": ["salle de sécurité"],
    "manager": [...allZones],
    "nettoyage": allZones.filter(z => z !== "salle d'archives")
};

// Création du modal de sélection
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
    fetch("empl.json")
        .then(res => res.json())
        .then(data => {
            dataEmployer = JSON.parse(localStorage.getItem("employer")) || data;
            renderDetails();
        });

    const input = document.getElementById("file");
    const photoModal = document.getElementById("photoModal");
    input.addEventListener("change", () => {
        photoModal.src = URL.createObjectURL(input.files[0]);
    });

    add_btn.addEventListener('click', () => {
        editingIndex = null; // mode ajout
        modal.style.display = 'flex';
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.style.display = "none";
        });
        document.getElementById("addForm").reset();
        photoModal.src = "";
    });

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

    document.getElementById("addForm").addEventListener("submit", ajouterEmployer);
});

// Rendu des cartes
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
              <img src="${emp.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">
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

// Détails employé modal
function cardDetails() {
    const cards = document.querySelectorAll(".profil-card");
    const previewModal = document.getElementById("modalPreview");
    const closeBtn = document.getElementById("closePreview");

    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            if(e.target.classList.contains("btn-edit") || e.target.classList.contains("btn-remove")) return;
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

// Edit / Remove buttons
function attachButtons() {
    document.querySelectorAll(".profil-card").forEach(card => {
        const btn = card.querySelector("button");
        if(card.dataset.assigned === "no") {
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

// Préparation zones
function prepareZoneButtons() {
    const plusBtns = document.querySelectorAll(".add-worker-btn");
    plusBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedZone = btn.parentElement;
            openSelectModal();
        });
    });
}

// Modal de sélection
function openSelectModal() {
    const list = document.getElementById("selectList");
    list.innerHTML = "";

    const zoneName = selectedZone.dataset.zone.toLowerCase();
    const unassigned = [...document.querySelectorAll(".profil-card[data-assigned='no']")];

    const available = unassigned.filter(card => {
        const emp = dataEmployer[card.dataset.index];
        return emp.allowedZones.map(z => z.toLowerCase()).includes(zoneName);
    });

    if(available.length === 0) list.innerHTML = "<p style='padding:10px;text-align:center;'>Aucun employé autorisé pour cette zone.</p>";

    available.forEach(card => {
        const clone = card.cloneNode(true);
        clone.style.cursor = "pointer";
        clone.addEventListener("click", () => {
            card.dataset.assigned = "yes";
            selectedZone.appendChild(card);
            attachButtons();
            modalSelect.style.display = "none";
        });
        list.appendChild(clone);
    });

    modalSelect.style.display = "flex";
}

// Ajouter ou modifier employé
function ajouterEmployer(e) {
    e.preventDefault();

    const firstname = document.getElementById("firstname").value.trim();
    const role = document.getElementById("role").value.trim();
    const email = document.getElementById("email").value.trim();
    const tele = document.getElementById("tele").value.trim();
    const photo = document.getElementById("photoModal").src;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{6,15}$/;

    if(!firstname || !role || !emailRegex.test(email) || !phoneRegex.test(tele) || !photo) {
        alert("Veuillez remplir correctement tous les champs et ajouter une photo.");
        return;
    }

    const roleLower = role.toLowerCase();
    const allowedZones = roleZones[roleLower] || allZones.filter(z => !["réception","salle des serveurs","salle de sécurité","salle d'archives"].includes(z));

    if(editingIndex !== null) {
        // Mettre à jour l'employé existant
        const emp = dataEmployer[editingIndex];
        emp.firstname = firstname;
        emp.role = role;
        emp.email = email;
        emp.tele = tele;
        emp.photo = photo;
        emp.allowedZones = allowedZones;
        editingIndex = null;
    } else {
        // Ajouter un nouvel employé
        dataEmployer.push({ firstname, role, email, tele, photo, allowedZones });
    }

    localStorage.setItem("employer", JSON.stringify(dataEmployer));
    renderDetails();
    document.getElementById("addForm").reset();
    document.getElementById("photoModal").src = "";
    modal.style.display = "none";
}
