const role="slave"
const socket=new WebSocket("ws://macbook-pro-di-nicola.local:7079")
let RECEIVE_BUFFER={}
let aux=null

socket.onopen=()=>
{
    send("resourceready").then(response=>
    {
        if(response.status)
        {
            fetch("/sound").then(response=>
            {
                response.blob().then(blob=>
                {
                    const url=URL.createObjectURL(blob);
                    aux=new Audio()
                    aux.src=url

                    let readybutton=document.createElement("button")
                    readybutton.innerHTML="ready"
                    readybutton.addEventListener("mouseup", ()=>
                    {
                        send("userready")
                    })

                    document.body.appendChild(readybutton)
                    
                })
            })
        }
    })
}

socket.onmessage=(mex)=>
{
    let {code, data, packID}=JSON.parse(String(mex.data))

    RECEIVE_BUFFER[code+"-"+packID]=data

    switch(code)
    {
        case "start":
            {
                let {ms}=data
                let interval=setInterval(()=>
                {
                    if(new Date().getTime()>=ms)
                    {
                        aux.play()
                        clearInterval(interval)
                    }
                }, 0)
            }
            break
    }
}

async function send(code, data)
{
    return new Promise((resolve, reject)=>
    {
        let packID=getRandomInt(0, 10000000)

        socket.send(JSON.stringify({code, data, packID, role}))

        const limit=1000
        let attempts=0
        const delay=100

        const interval=setInterval(()=>
        {
            if(Object.keys(RECEIVE_BUFFER).includes(code+"-"+packID))
            {
                let dumped=RECEIVE_BUFFER[code+"-"+packID]
                delete RECEIVE_BUFFER[code+"-"+packID]
                resolve(dumped)
                clearInterval(interval)
            }
            else
            {
                attempts++

                if(attempts>=limit)
                {
                    resolve(false)
                    clearInterval(interval)
                }
            }
        }, delay)

    })

    function getRandomInt(min, max)
    {
        return Math.floor(Math.random() * (max - min) + min);
    }
}

