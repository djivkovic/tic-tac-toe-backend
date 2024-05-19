import { Request, Response } from 'express';
import * as AuthService from '../services/authService';
export const register = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await AuthService.registerUser(username, password);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await AuthService.loginUser(username, password);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
