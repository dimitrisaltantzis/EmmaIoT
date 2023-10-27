import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async(e)=>{
    e.preventDefault();

    const data = new FormData(form);

    //users chatstripe 
    chatContainer.innerHTML+= chatStripe(false, data.get('prompt'));
    form.reset();

    //bots chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML+= chatStripe(true, "" , uniqueId);
    

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);
    
   //fetch data from server -> bots response 

   const response = await fetch('http://localhost:7070/',{
    method:'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({
        prompt:data.get('prompt')
    })
   })
   clearInterval(loadInterval);
   messageDiv.innerHTML='';
   
   if(response.ok) {
    const data =await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv,parseData);
   }else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong!";
   }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        handleSubmit(e)
    }
})