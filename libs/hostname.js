module.exports = function() {
    return function hostname( req, res, next ) {
        req.hostname = req.hostname;
        res.locals.hostname = req.hostname;
        next();
    };
};
