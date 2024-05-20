import UserModel from '../db/User';

export const findUserByUsername = async (username: string) => {
    return await UserModel.findOne({ username });
};
