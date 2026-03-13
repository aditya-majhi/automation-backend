import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updateUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const userData = req.body;
        const updatedUser = await userService.updateUser(userId, userData);
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};