const http = require ("http");
const server = http.createServer((req,res) => {

const usuarios = [

    {
        id:2,
        nome: "Maria"

    },

    {
        id: 3,
        nome: "Pedro"
    }
]    


if(req.url === "/"){
    res.setHeader("Content-Type","text/plain; charset=utf-8");
    res.end("Bem vindo a essa bagaça");
}

if(req.url === "/usuarios"){
res.setHeader("Content-Type","application/json");
res.end(JSON.stringify(usuarios));
}

});

server.listen(3000);

