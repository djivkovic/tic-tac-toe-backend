import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../db/User';

const jwtKey = 'tictactoe';
export const registerUser = async (username: string, password: string) => {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
        throw new Error('User already exists!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new UserModel({
        username,
        password: hashedPassword
    });

    await newUser.save();

    const payload = { id: newUser._id, username: newUser.username };
    const token = jwt.sign(payload, jwtKey, { expiresIn: '2h' });

    return { user: newUser, auth: token };
};

export const loginUser = async (username: string, password: string) => {
    const user = await UserModel.findOne({ username });
    if (!user) {
        throw new Error('User not found!');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Incorrect password!');
    }

    const payload = { id: user._id, username: user.username };
    const token = jwt.sign(payload, jwtKey, { expiresIn: '2h' });

    return { user, auth: token };
};
