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
        origin: process.env.NODE_ENV === "production" ? false : ["https://chatapp-1-owus.onrender.com"]
    }
})

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    // Upon connection - only to user
    socket.emit('message', buildMsg(ADMIN, "Welcome!"))

    //upon connection to all users in the room
    socket.on('enterRoom', ({name,room}) => {
        //leave previous room
        const prevRoom = getUser(socket.id)?.room

        if(prevRoom){
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message',buildMsg(ADMIN,` ${name} has left the room`))
        }

        const user = activateUser(socket.id,name,room)

        //cannot update previous room users list until state update in activate user
        if (prevRoom){
            io.to(prevRoom).emit('userList', {
                users: getUsersInRoom(prevRoom)
            })
        }

        //join room
        socket.join(user.room)
        
        //to user who entered room
        socket.emit('message', buildMsg(ADMIN,`You have joined the ${user.room} chat room`))

        //to everyone else
        socket.broadcast.to(user.room).emit('message',buildMsg(ADMIN, `${user.room} has joined the chat room`))

        //update user list for room
        io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
        })

        //update rooms list for everyone
        io.emit('roomList', {
            rooms: getAllActiveRooms
        })
        
    })

    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        userLeave(socket.id)
        
        if(user){
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`))

            io.to(user.room).emit('UserList', {
                users: getUsersInRoom(user.room)
            })
            to.emit('roomList', {
                rooms: getAllActiveRooms
            })
        }
        console.log(`user ${socket.id} has disconnected`)
    })

    socket.on('message', ({name,text}) => {
        const room = getUser(socket.id)?.room
        if(room){
            io.to(room).emit('message',buildMsg(name, text))
        }
        
    })

    

    //listen for activity
    socket.on('activity', (name) => {
        const room = getUser(socket.id)?.room
        if(room){
            socket.broadcast.to(room).emit('activitu', name)
        }
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

function getUsersInRoom(room){
    return UsersState.users.filter(user => user.room ===room)
}

function getAllActiveRooms(){
    return Array.from(new Set(UsersState.users.map(user => user.room)))
}