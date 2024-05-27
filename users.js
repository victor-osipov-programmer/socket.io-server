const { trimStr } = require("./utils");

let users = [];

function findUser(user) {
    const userName = trimStr(user.name);
    const userRoom = trimStr(user.room);

    return users.find(
        (u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom
    );
}

function addUser(user) {
    const isExist = findUser(user);

    !isExist && users.push(user);

    const currentUser = isExist || user;

    return {
        isExist: !!isExist,
        user: currentUser,
    };
}

function getRoomUsers(room) {
    return users.filter((u) => u.room === room)
}

function removeUser(user) {
    const found = findUser(user)

    if (found) {
        users = users.filter(
            ({ room, name }) => room === found.room && name !== found.name
        );
    }

    return found
}

module.exports = {
    addUser,
    findUser,
    getRoomUsers,
    removeUser,
};
