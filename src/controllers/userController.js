import User from "../models/user.js"

export const getAllUsers = async(req, res) => {
    try {
        const { userId } = req.query;
        const allUsers = await User.find({});
        return res.status(200).send(allUsers.filter(user => user._id.toString() !== userId));
    } catch (err) {
        res.status(400).send(err);
    }
}