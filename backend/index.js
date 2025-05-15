const app = require("./src/config/express.config");
require("dotenv").config();
const http = require("http")

const server = http.createServer(app)

const port = process.env.PORT || 3000;

server.listen( port, 'localhost',(error)=>{
    if(error){
        console.log("server error")
    }
    else{
        console.log("Server is running on port :"+port)
        console.log("Press CSTRL+C to discontinue server.")
    }
})

