module.exports = (ws) => {
    ws.json = function (data) {
        if (data) ws.send(JSON.stringify(data))
    }
}