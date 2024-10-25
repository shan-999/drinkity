let nameError = document.getElementById('nameError')
let emailError = document.getElementById('emailError')
let passwordError = document.getElementById('passwordError')
let cPasswordError = document.getElementById('cPasswordError')


function namevalidate() {
    let username = document.getElementById('username').value
    let regex = /^[A-Za-z_]{5,}$/


    if(!regex.test(username)){
        nameError.innerHTML = 'Username must be at least 5 characters long, can only contain letters or underscores'
        return false 
    }
    nameError.innerHTML = ''
    return true
}


function emailvalidate() {
    let email = document.getElementById('email').value
    let regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/


    
    if(!regex.test(email)){
        
        emailError.innerHTML = 'Enter a valied email'
        return false 
    }
    emailError.innerHTML = ''
    return true
}


function passwordvalidate() {
    let password = document.getElementById('password').value
    let regex = /^(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,}$/
    if(!regex.test(password)){
        passwordError.innerHTML = 'Password must be at least 5 characters long, contain at least one number and one special character'
        return false 
    }
    passwordError.innerHTML = ''
    return true
}




function cPasswordvalidate() {
    let cPassword = document.getElementById('confirmPassword').value
    let password = document.getElementById('password').value
    
    if(cPassword !== password){

        cPasswordError.innerHTML = 'Password not match'
        return false 
    }
    cPasswordError.innerHTML = ''
    return true
}



function verifySubmit(event) {
    let isNameValid = namevalidate();
    let isEmailValid = emailvalidate();
    let isPasswordValid = passwordvalidate();
    let isCPasswordValid = cPasswordvalidate();

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isCPasswordValid) {
        event.preventDefault();
    } 
}