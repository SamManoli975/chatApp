import express from 'express'
import { Server } from "socket.io"
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000
const ADMIN = "Admin" 

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

//state for users
const UsersState = {
    users: [],
    setUsers: function(newUsersArray){
        this.users = newUsersArray
    }
}

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    // Upon connection - only to user
    socket.emit('message', "Welcome!")

    socket.broadcast.emit('message', `${socket.id.substring(0, 5)} connected`)
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('message', `${socket.id.substring(0, 5)} disonnected`)
    })

    //listen for activity
    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name )
    })
})


function buildMsg(name,text){
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    }
}

//user functions
function activateUser(id, name, room){
    const user = {id, name, room}
    UsersState.setUsers([
        //filter users
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

function userLeave(id){
    UsersState.setUsers(
        UsersState.users.filter(user => users.id !== id)
    )
}

function getUser(id){
    return UsersState.users.find(user => user.id === id)
}

function getUserInRoom(room){
    return UsersState.users.filter(user => user.room ===room)
}

function getAllActiveRooms(){
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}