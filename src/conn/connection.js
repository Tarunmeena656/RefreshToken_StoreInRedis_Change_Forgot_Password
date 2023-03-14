const { set , connect ,connection} = require('mongoose')

function connectDatabase(){
    set('strictQuery',true)
    return connect('mongodb://127.0.0.1/TokenExample')
}

connection.on("connected", ()=> {
    console.log("Connection Successfully")
}  
)

module.exports = connectDatabase