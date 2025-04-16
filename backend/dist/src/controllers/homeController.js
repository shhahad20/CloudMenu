export const home = async (req, res, next) => {
    try {
        res.status(200).json({
            message: `Hello there!`,
        });
    }
    catch (error) {
        next(error);
    }
};
