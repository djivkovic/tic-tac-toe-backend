import UserModel from '../db/User';
export const findUserByUsername = async (username: string) => {
    try {
        return await UserModel.findOne({ username });
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw new Error('Failed to find user by username!');
    }
};
