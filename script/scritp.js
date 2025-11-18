
// function openModal() {
// document.getElementById('modal').style.display = 'flex';
// }

let employers = [
    {
        "firstname" : "chouaib",
        "role": "Agent",
        "email" : "choubbati@gmail.com",
        "tele" : "0610708182",
        "photo" : "1523-1760996189.png"

    }
]



let add_btn = document.getElementById("btn-add")
let modal = document.getElementById("modal")
const input = document.getElementById("file");
const photoModal = document.getElementById("photoModal");


add_btn.addEventListener('click', function () {
    modal.style.display = 'flex'
    document.getElementById('modal').addEventListener('click', function (e) {
        if (e.target === this) { this.style.display = 'none'; }
    });

})

document.getElementById("ajouteCompitence").addEventListener("click", () => {
    document.getElementById("dynamiqueForm").innerHTML +=
    `   <label for="name" class="form-label">Name</label>
        <input type="text" name="name" id="name" placeholder="Competence name" class="form-control">
                       

    `
})


function randerDails(){

}

function ajouter(e) {
    e.preventDefault()
    let form = e.target

    let employer = {
        firstname : form.firstname.value,
        role : form.role.value,
        email : form.email.value,
        tele : form.tele.value,
      
    }
    

}

input.addEventListener("change", () => {
    photoModal.src = URL.createObjectURL(input.files[0]);
});