
function validateInput(current, nextFieldID) {
    const value = current.value;
    const isNumber = /^[0-9]+$/.test(value);  

    if (!isNumber) {
        current.value = '';  
    } else if (nextFieldID && value.length === 1) {
        document.getElementById(nextFieldID).focus(); 
    }
}

document.querySelectorAll('.code-inputs input').forEach((input, index, inputs) => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && input.value.length === 0 && index > 0) {
            inputs[index - 1].focus(); 
        }
    });
});


document.getElementById('input1').addEventListener('input', () => validateInput(document.getElementById('input1'), 'input2'));
document.getElementById('input2').addEventListener('input', () => validateInput(document.getElementById('input2'), 'input3'));
document.getElementById('input3').addEventListener('input', () => validateInput(document.getElementById('input3'), 'input4'));
document.getElementById('input4').addEventListener('input', () => validateInput(document.getElementById('input4')));



document.addEventListener('DOMContentLoaded',() => {
    const timer = document.getElementById('timer')
    const resendLink = document.querySelector('.resend-link')
    const resend = document.querySelector('.resend')

    let sec = parseInt(sessionStorage.getItem('timeLeft'), 10);
    if (isNaN(sec) || sec < 0) sec = 60;
    let interval
 
    timer.innerHTML =sec 

    const startTimer = () => {
        clearInterval(interval); 

        interval = setInterval(() => {
            sec--
            sessionStorage.setItem('timeLeft',sec)
            console.log("from start timer : ",sessionStorage.getItem('timeLeft'))
            if(sec < 0){
                clearInterval(interval)
                resendLink.style.display = 'block'
                resend.style.display = 'none'
            }else{
                timer.innerHTML = sec
                console.log("after sec will show : ",sessionStorage.getItem('timeLeft'))
            }
        },1000)

    }


    const checkEmail = () => {
        const newEmail = sessionStorage.getItem('tempEmail')
        const lastEmail = sessionStorage.getItem('lastEmail')
        
        if(newEmail !== lastEmail){
            console.log(`newemail : ${newEmail}    lastEmail : ${lastEmail}`);
            sessionStorage.setItem('lastEmail',newEmail)
            clearInterval(interval);
            sec = 60;
            sessionStorage.setItem('timeLeft', sec); 
            resendLink.style.display = 'none';
            resend.style.display = 'block';

            startTimer();
        }   
    } 

    startTimer()

    setInterval(checkEmail , 1000)
})


 