let emailError = document.getElementById('emailError')
let passwordError = document.getElementById('passwordError')

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



function verifySubmit(event) {
    let isEmailValid = emailvalidate();
    let isPasswordValid = passwordvalidate();

    if (!isEmailValid || !isPasswordValid) {
        event.preventDefault();
    }
}