let dataEmployer = [];
let add_btn = document.getElementById("btn-add");
let modal = document.getElementById("modal");

// === Nouveau: Modal de sélection d'employé pour une zone === //
let selectedZone = null;
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

document.addEventListener("DOMContentLoaded", () => {

    fetch("empl.json")
        .then(res => res.json())
        .then(data => {
            dataEmployer = JSON.parse(localStorage.getItem("employer")) || data;
            renderDetails();
        });

    // Prévisualisation photo
    const input = document.getElementById("file");
    const photoModal = document.getElementById("photoModal");
    input.addEventListener("change", () => {
        photoModal.src = URL.createObjectURL(input.files[0]);
    });

    // Ouvrir Modal d'ajout
    add_btn.addEventListener('click', () => {
        modal.style.display = 'flex';
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });
    });

    // Ajouter expériences dynamiques
    const containerExp = document.getElementById("experiencesContainer");
    const addExpBtn = document.getElementById("addExperienceBtn");
    addExpBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.classList.add("experience");
        div.innerHTML = `
            <input type="text" name="poste[]" placeholder="Poste">
            <input type="text" name="duree[]" placeholder="Durée">
            <input type="text" name="description[]" placeholder="Description">
            <button type="button" class="removeExperience">Supprimer</button>
        `;
        containerExp.appendChild(div);
    });
    containerExp.addEventListener("click", e => {
        if (e.target.classList.contains("removeExperience")) e.target.parentElement.remove();
    });

    document.getElementById("addForm").addEventListener("submit", ajouterEmployer);
});
