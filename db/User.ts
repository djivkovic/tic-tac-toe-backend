import mongoose, { Schema, Document, Model } from "mongoose";

interface User extends Document {
    username: string;
    password: string;
}

const userSchema: Schema<User> = new Schema<User>({
    username: String,
    password: String
});

const UserModel: Model<User> = mongoose.model<User>("users", userSchema);

export default UserModel;
