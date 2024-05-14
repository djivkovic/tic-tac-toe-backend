"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connect = mongoose_1.default.connect("mongodb://127.0.0.1:27017/tictactoe-db");
connect.then(() => {
    console.log('MongoDB connected');
})
    .catch(() => {
    console.error('Error connecting to MongoDB');
});
