import ApiError from '../errors/ApiError.js';
const apiErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.code).json({
            status: err.code,
            message: err.message,
        });
        return;
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({
        status: 500,
        message: 'Something went wrong.',
    });
};
export default apiErrorHandler;
