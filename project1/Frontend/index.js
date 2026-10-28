
document.addEventListener('DOMContentLoaded', function() {
    // one can point your browser to http://localhost:5050/getAll to check what it returns first.
    fetch('http://localhost:5050/getAll')     
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
});



const addBtn = document.querySelector('#add-btn');
addBtn.onclick = function() {

    const usernameInput = document.querySelector('#username-add-input');
    const firstnameInput = document.querySelector('#firstname-add-input');
    const lastnameInput = document.querySelector('#lastname-add-input');
    const salaryInput = document.querySelector('#salary-add-input');
    const ageInput = document.querySelector('#age-add-input');
    const passwordInput = document.querySelector('#password-add-input');

    const username = usernameInput.value;
    const firstname = firstnameInput.value;
    const lastname = lastnameInput.value;
    const salary = salaryInput.value;
    const age = ageInput.value;
    const password = passwordInput.value;

    fetch('/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            salary: Number(salary),
            age: Number(age)
        })
    })
    .then(async response => {
        const data = await response.json();

        if (!response.ok) {
            document.getElementById("login-message").textContent = data.message;
        }

        return data;
    })
    .then(data => {
        if (data.success) {
            console.log("User added successfully!");
            document.getElementById("login-message").textContent = data.message;


            usernameInput.value = "";
            firstnameInput.value = "";
            lastnameInput.value = "";
            salaryInput.value = "";
            ageInput.value = "";
            passwordInput.value = "";

            location.reload();
        }
    })
    .catch(error => {
        console.error("Error inserting user:", error);
    });
};


const searchBtn =  document.querySelector('#search-btn');
searchBtn.onclick = function (){
    const searchInputFirst = document.querySelector('#search-input-name-first');
    let searchValueFirst;
    if (searchInputFirst.value.trim() === ""){
        searchValueFirst = "-";
    }else{
        searchValueFirst = searchInputFirst.value.trim();
    }


    const searchInputSecond = document.querySelector('#search-input-name-last');
    let searchValueSecond;
    if (searchInputSecond.value.trim() === ""){
        searchValueSecond = "-";
    }else{
        searchValueSecond = searchInputSecond.value.trim();
    }
    
    searchInputFirst.value = "";

    searchInputSecond.value = "";
    
    fetch('http://localhost:5050/search/' + searchValueFirst + '/' + searchValueSecond )
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

const searchIdBtn = document.querySelector('#search-id-btn');
searchIdBtn.onclick = function(){
    const searchInputId = document.querySelector('#search-input-id');
    const searchValueId = searchInputId.value;
    searchInputId.value = "";

    fetch('http://localhost:5050/searchid/' + searchValueId)
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

const searchSalaryBtn = document.querySelector('#search-salary-btn');
searchSalaryBtn.onclick = function(){
    const lowerBoundSalary = document.querySelector('#search-input-X-salary');
    const lowerBoundSalaryValue = lowerBoundSalary.value;
    const upperBoundSalary = document.querySelector('#search-input-Y-salary')
    const upperBoundSalaryValue = upperBoundSalary.value;
    lowerBoundSalary.value = "";
    upperBoundSalary.value = "";


    fetch('http://localhost:5050/searchSalary/' + lowerBoundSalaryValue + '/' + upperBoundSalaryValue)
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));

}

const searchAgeBtn = document.querySelector('#search-age-btn');
searchAgeBtn.onclick = function(){
    const lowerBoundAge = document.querySelector('#search-input-X-age');
    const lowerBoundAgeValue = lowerBoundAge.value;
    const upperBoundAge = document.querySelector('#search-input-Y-age')
    const upperBoundAgeValue = upperBoundAge.value;
    lowerBoundAge.value = "";
    upperBoundAge.value = "";


    fetch('http://localhost:5050/searchAge/' + lowerBoundAgeValue + '/' + upperBoundAgeValue)
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));

}

const searchNULLSignin = document.querySelector('#search-NULL-signin-btn');
searchNULLSignin.onclick = function(){
    fetch('http://localhost:5050/searchNULLSignin')
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

const searchAfterJohn = document.querySelector('#search-John-after-btn');
searchAfterJohn.onclick = function(){
    fetch('http://localhost:5050/searchJohn')
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

const searchSameJohn = document.querySelector('#search-John-sameday-btn');
searchSameJohn.onclick = function(){
    fetch('http://localhost:5050/searchJohnSame')
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

const searchSameDay = document.querySelector('#search-sameday-btn');
searchSameDay.onclick = function(){
    fetch('http://localhost:5050/searchSameDay')
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']));
}

let rowToDelete; 

document.querySelector('table tbody').addEventListener('click', 
      function(event){
        if(event.target.className === "delete-row-btn"){

            deleteRowById(event.target.dataset.id);   
            rowToDelete = event.target.parentNode.parentNode.rowIndex;    
            debug("delete which one:");
            debug(rowToDelete);
        }   
        if(event.target.className === "edit-row-btn"){
            showEditRowInterface(event.target.dataset.id);
        }
      }
);

function deleteRowById(id){
    fetch('http://localhost:5050/delete/' + id,
       { 
        method: 'DELETE'
       }
    )
    .then(response => response.json())
    .then(
         data => {
             if(data.success){
                document.getElementById("table").deleteRow(rowToDelete);
             }
         }
    );
}

let idToUpdate = 0;

function showEditRowInterface(id){
    debug("id clicked: ");
    debug(id);
    document.querySelector('#update-firstname-input').value = "";
    document.querySelector('#update-lastname-input').value = "";

    const updateSetction = document.querySelector("#update-row");  
    updateSetction.hidden = false;
    idToUpdate = id;
    debug("id set!");
    debug(idToUpdate+"");
}


const updateBtn = document.querySelector('#update-row-btn');

updateBtn.onclick = function() {
    const firstname = document.querySelector('#update-firstname-input').value;
    const lastname = document.querySelector('#update-lastname-input').value;

    fetch('/update', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({
            id: idToUpdate,
            firstname: firstname,
            lastname: lastname
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    })
    .catch(err => console.error(err));
};



function debug(data)
{
    fetch('http://localhost:5050/debug', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({debug: data})
    })
}

/*
function insertRowIntoTable(data){

   debug("index.js: insertRowIntoTable called: ");
   debug(data);

   const table = document.querySelector('table tbody');
   debug(table);

   const isTableData = table.querySelector('.no-data');

  // debug(isTableData);

   let tableHtml = "<tr>";
   
   for(var key in data){ // iterating over the each property key of an object data
      if(data.hasOwnProperty(key)){   // key is a direct property for data
            if(key === 'dateAdded'){  // the property is 'dataAdded'
                data[key] = new Date(data[key]).toLocaleString(); // format to javascript string
            }
            tableHtml += `<td>${data[key]}</td>`;
      }
   }

   tableHtml +=`<td><button class="delete-row-btn" data-id=${data.id}>Delete</td>`;
   tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</td>`;

   tableHtml += "</tr>";

    if(isTableData){
       debug("case 1");
       table.innerHTML = tableHtml;
    }
    else {
        debug("case 2");
        // debug(tableHtml);

        const newrow = table.insertRow();
        newrow.innerHTML = tableHtml;
    }
}

*/

function loadHTMLTable(data){
    debug("index.js: loadHTMLTable called.");

    const table = document.querySelector('table tbody'); 
    
    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }
  
   

    let tableHtml = "";
    data.forEach(function(row) {
        tableHtml += "<tr>";

        tableHtml += `<td>${row.id}</td>`;
        tableHtml += `<td>${row.username}</td>`;
        tableHtml += `<td>${row.firstname}</td>`;
        tableHtml += `<td>${row.lastname}</td>`;
        tableHtml += `<td>${row.salary}</td>`;
        tableHtml += `<td>${row.age}</td>`;
        tableHtml += `<td>${new Date(row.registerday).toLocaleDateString()}</td>`;
        tableHtml += `<td>${row.signintime ?? ""}</td>`;

        tableHtml += `<td><button class="delete-row-btn" data-id="${row.id}">Delete</button></td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id="${row.id}">Edit</button></td>`;

        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}

document.getElementById("logout-btn")?.addEventListener("click", async () => {
    const response = await fetch("/logout", { method: "POST" });

    if (response.ok) {
        window.location.href = "/";
    }
});
