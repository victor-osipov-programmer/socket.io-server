const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { router } = require("./router");
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");

const port = 5000;

const app = express();
// app.use(cors())
app.use(router);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    },
});

io.on("connection", (socket) => {
    console.log("connected");

    socket.on("join", ({ name, room }) => {
        socket.join(room);

        const { user, isExist } = addUser({ name, room });

        const userMessage = isExist
            ? `${user.name}, вы вернулись к нам!`
            : "Добро пожаловать!";
        const admiMessage = isExist
            ? `${user.name}, вернулся в беседу!`
            : `${user.name} зашёл в беседу`;

        socket.emit("message", {
            data: { user: { name: "Admin" }, message: userMessage },
        });

        socket.broadcast.to(user.room).emit("message", {
            data: {
                user: { name: "Admin" },
                message: admiMessage,
            },
        });

        io.to(user.room).emit("joinRoom", {
            data: { users: getRoomUsers(user.room) },
        });
    });

    socket.on("sendMessage", ({ message, params }) => {
        const user = findUser(params);

        if (user) {
            io.to(user.room).emit("message", { data: { user, message } });
        }
    });

    socket.on("leftRoom", ({ params }) => {
        const user = removeUser(params);

        if (user) {
            const { room, name } = user;

            io.to(room).emit("message", {
                data: { user: { name: "Admin" }, message: `${name} покинул нас.........` },
            });

            io.to(room).emit("leftRoom", {
                data: { users: getRoomUsers(room) },
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("disconnect");
    });
});

server.listen(port, () => console.log("Server started on port " + port));
