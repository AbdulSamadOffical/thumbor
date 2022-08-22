const axios = require('axios')
async function calls(){
    
for(let i = 0;i<10; i++){

    const data = await axios('https://jsonplaceholder.typicode.com/todos/1')
        console.log(data)
}
}

calls();

console.log("it ran")