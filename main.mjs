import express from "express";
import ws from "./node_modules/ws/index.js";
import fs from "fs";
import path from "path";

const app = express();

app.use(express.static("public"));

app.get("/sound", (req, res) => {
    res.sendFile(path.resolve("resources/sound.mp3"));
});

app.listen(7078, () => {
    console.log("HTTP server listening on http://localhost:7078");
});

const wss = new ws.Server({ port: 7079 });
const clientDataMap = new Map();

wss.on("connection", (socket)=>
{
    console.log("Nuova connessione WebSocket");

    let clientsession={}
    clientDataMap.set(socket, clientsession);

    socket.on("message", (message) =>
    {
        const {code, role, data, packID} = JSON.parse(message);

        clientsession.role=role

        switch(code)
        {
            case "resourceready":
                {
                    send(code, packID, {status:true})
                }
                break

            case "userready":
                {
                    clientsession.ready=true
                }
                break

            case "start":
                {
                    clientsession.ready=true

                    let shift=3
                    let timekey=(new Date().getTime()+(1000*shift))

                    clientDataMap.forEach((obj, conn) =>
                    {
                        if(obj.ready)
                        {
                            ssend(conn, code, 0, {ms:timekey})
                        }
                    })
                }
                break
        }
    });

    socket.on("close", () => {
        console.log("Connessione chiusa");
        clientDataMap.delete(socket);
    });

    function send(code, packID, data)
    {
        socket.send(JSON.stringify({code, packID, data}))
    }

    function ssend(conn, code, packID, data)
    {
        conn.send(JSON.stringify({code, packID, data}))
    }
});
