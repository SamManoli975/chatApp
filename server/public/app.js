const socket = io('ws://localhost:3000')

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplau = document.querySelector('.chat-display')


function sendMessage(e) {
    e.preventDefault()
    
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text:msgInput.value,
    })
        msgInput.value = ""
    }
    msgInput.focus()
}


function enterRoom(e){
    e.preventDefault
    if(nameInput.value && chatRoom.value){
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
    }
}

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = ""
    const { name, text, time} =data
    const li = document.createElement('li')
    li.className = 'post'
    if(name === nameInput.value) li.className = 'post post--left'
    if(name !== nameInput.value && name !== 'Admin') li.className = 'post post--right'
    if(name !== 'Admin'){
        li.innerHTML = `<div class="post__header ${name ===nameInput.value
            ? 'post__header--user'
            : 'post__header--reply'
        }">
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
        </div>
        <div class="post__text">${text}</div>`
    }else{//admin messages 
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    document.querySelector('ul').appendChild(li)
})



let activityTimer
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`

    //clear after 1 second
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 1000)
})