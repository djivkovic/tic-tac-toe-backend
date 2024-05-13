const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb://127.0.0.1:27017/tictactoe-db");

connect.then(()=>{
    console.log('MongoDB connected');
})
.catch(()=>{
    console.error('Error connecting to MongoDB');
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


const collection = new mongoose.model("users", UserSchema);

module.exports = collection;