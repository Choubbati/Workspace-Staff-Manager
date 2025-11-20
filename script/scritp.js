let dataEmployer = [];
let add_btn = document.getElementById("btn-add");
let modal = document.getElementById("modal");
let selectedZone = null;

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

// Modal de sélection
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
        modal.style.display = 'flex';
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.style.display = "none";
        });
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

// Edit / Remove buttons



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

    if (available.length === 0) list.innerHTML = "<p style='padding:10px;text-align:center;'>Aucun employé autorisé pour cette zone.</p>";

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

// Ajouter employé
function ajouterEmployer(e) {
    e.preventDefault();
    const firstname = document.getElementById("firstname");
    const role = document.getElementById("role");
    const email = document.getElementById("email");
    const tele = document.getElementById("tele");
    const photoModal = document.getElementById("photoModal");

    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{6,15}$/;

    [firstname, role, email, tele].forEach(input => input.style.border = "1px solid #ccc");

    if (firstname.value.trim() === "") { firstname.style.border = "2px solid red"; valid = false; }
    if (role.value.trim() === "") { role.style.border = "2px solid red"; valid = false; }
    if (!emailRegex.test(email.value.trim())) { email.style.border = "2px solid red"; valid = false; }
    if (!phoneRegex.test(tele.value.trim())) { tele.style.border = "2px solid red"; valid = false; }
    if (photoModal.src === "") { alert("attention ajouter une photo"); valid = false; }

    if (!valid) return;

    const roleLower = role.value.trim().toLowerCase();
    let allowedZones = roleZones[roleLower] || allZones.filter(z => !["réception", "salle des serveurs", "salle de sécurité", "salle d'archives"].includes(z));

    const employer = {
        firstname: firstname.value.trim(),
        role: role.value.trim(),
        email: email.value.trim(),
        tele: tele.value.trim(),
        photo: photoModal.src,
        allowedZones: allowedZones
    };

    dataEmployer.push(employer);
    localStorage.setItem("employer", JSON.stringify(dataEmployer));
    renderDetails();
    document.getElementById("addForm").reset();
    photoModal.src = "";
    modal.style.display = "none";
}
