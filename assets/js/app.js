const cl = console.log;

const studForm = document.getElementById('studForm')
const stdList = document.getElementById('stdList')
const fname = document.getElementById('fname')
const lname = document.getElementById('lname')
const email = document.getElementById('email')
const contact = document.getElementById('contact')
const addStd = document.getElementById('addStd')
const updateStd = document.getElementById('updateStd')
const spinner = document.getElementById('spinner')

const base_url = `https://bhagyashri-s-first-database-default-rtdb.firebaseio.com/`
const stud_url = `${base_url}/students.json`

let state = {
    studArr: [],
    updateid: null
}

//snackbar function
function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2500
    })
}

// function nestedObjtoArr(){

//     for (const key in object) {

//     }
// }


//function for spinner
function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove('d-none')
    } else {
        spinner.classList.add('d-none')
    }
}

//generic function 
function makeApiCall(url, methodName, body) {
    handleSpinner(true)
    body = body ? JSON.stringify(body) : null
    return fetch(url, {
        method: methodName,
        body: body,
        headers: {
            "content-type": "application/json",
            "autho": "JWT token"
        }
    })

        .then(res => {
            if (!res.ok) {
                throw new Error('Http : error')
            }
            return res.json()
        })
}

//show data on UI
function renderStdDataOnUI(arr) {
    let result = '';

    arr.forEach((ele, i) => {
        result += `<tr id="${ele.id}">
                                    <td>${i + 1}</td>
                                    <td>${ele.fname}</td>
                                    <td>${ele.lname}</td>
                                    <td>${ele.email}</td>
                                    <td>${ele.contact}</td>
                                    <td><button onclick="onEdit(this)" class="btn btn-success"><i
                                                class="fa-solid fa-pen-to-square fa-2x"></i></button></td>
                                    <td><button onclick="onDelete(this)" class="btn btn-danger"><i class="fa-solid fa-trash fa-2x"></i></button></td>
                                </tr>`
    });
    stdList.innerHTML = result;
}

makeApiCall(stud_url, "GET")
    .then(data => {
        for (const key in data) {
            data[key].id = key

            state.studArr.push(data[key])
            // cl(state.studArr)
        }
        renderStdDataOnUI(state.studArr)
    })
    .catch(err => {
        snackbar('something went wrong which fetching student data', 'error')
    })
    .finally(() => {
        handleSpinner()
    })

//function create
function onSubmit(eve) {
    eve.preventDefault();

    let newStd = {
        fname: fname.value,
        lname: lname.value,
        email: email.value,
        contact: contact.value
    }

    makeApiCall(stud_url, "POST", body = newStd)
        .then(data => {
            newStd.id = data.name
            state.studArr.push(newStd)
            studForm.reset()
            // cl(state.studArr)

            let tr = document.createElement('tr')
            tr.id = data.name
            tr.className = 'table table-bordered table-hover'
            tr.innerHTML = `<td>${state.studArr.length}</td>
                                    <td>${newStd.fname}</td>
                                    <td>${newStd.lname}</td>
                                    <td>${newStd.email}</td>
                                    <td>${newStd.contact}</td>
                                    <td><button onclick="onEdit(this)" class="btn btn-success"><i
                                                class="fa-solid fa-pen-to-square fa-2x"></i></button></td>
                                    <td><button onclick="onDelete(this)" class="btn btn-danger"><i class="fa-solid fa-trash fa-2x"></i></button></td>`
            stdList.append(tr)
            snackbar(`new student with name ${newStd.fname} ${newStd.lname} created successfully`, 'success')
        })
        .catch(err => {
            snackbar(err, 'error')
        })
        .finally(() => {
            handleSpinner()
        })
}

function onEdit(ele) {
    handleSpinner(true)
    let editId = ele.closest('tr').id;
    // cl(editId)
    // let edit_url = `${base_url}/students/${editId}.json`

    state.updateid = editId

    let editObj = state.studArr.find(e => e.id === editId)
    // cl(editObj)

    fname.value = editObj.fname
    lname.value = editObj.lname
    email.value = editObj.email
    contact.value = editObj.contact

    handleSpinner()

    addStd.classList.add('d-none')
    updateStd.classList.remove('d-none')
}

function onUpdateStd() {
    let updateId = state.updateid;
    // cl(updateId)

    let update_url = `${base_url}/students/${updateId}.json`

    let updateObj = {
        fname: fname.value,
        lname: lname.value,
        email: email.value,
        contact: contact.value,
        id: updateId
    }
    // cl(updateObj)

    makeApiCall(update_url, "PATCH", body = updateObj)
        .then(data => {
            let getIndex = state.studArr.findIndex(e => e.id === updateId)
            // cl(getIndex)
            state.studArr[getIndex] = updateObj

            let tr = document.getElementById(updateId).children;
            tr[1].innerHTML = updateObj.fname
            tr[2].innerHTML = updateObj.lname
            tr[3].innerHTML = updateObj.email
            tr[4].innerHTML = updateObj.contact

            snackbar(`student with name ${updateObj.fname} ${updateObj.lname} updated successfully`, 'success')
            // handleSpinner()

            addStd.classList.remove('d-none')
            updateStd.classList.add('d-none')
        })
        .catch(err => {
            snackbar(`something went wrong while updating the student`, 'success')
        })
        .finally(() => {
            handleSpinner()
        })

}

function onDelete(ele) {
    let deleteId = ele.closest('tr').id;
    // cl(deleteId)

    let delete_url = `${base_url}/students/${deleteId}.json`


    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Remove it!"
    }).then((result) => {
        if (result.isConfirmed) {
            makeApiCall(delete_url, "DELETE", body = null)

            .then(data =>{
                let getIndex = state.studArr.findIndex(e => e.id === deleteId)
                // cl(getIndex)
                state.studArr.splice(getIndex, 1)

                ele.closest('tr').remove()

                snackbar(`student with id ${deleteId} deleted successfully`)

                let tr = document.querySelectorAll('#stdList tr td:first-child')
                tr.forEach((e, i) => e.innetText = i + 1)
            })
            .catch(err => {
                snackbar('something went wrong while deleting the student', 'error' )
            })
            .finally(()=>{
                handleSpinner()
            })
        }
    });
}



studForm.addEventListener('submit', onSubmit)
updateStd.addEventListener('click', onUpdateStd)


