import { createUserSchema } from '../../services/schemaManager';
export const creatSchema = async (req, res, next) => {
    const userId = req.body.userId; // Extract the user ID from the request body
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const result = await createUserSchema(userId);
        res.json({ message: `Schema for user ${userId} created successfully`, result });
    }
    catch (error) {
        next(error);
    }
};
