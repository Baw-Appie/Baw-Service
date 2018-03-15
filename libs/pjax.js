module.exports = function() {
    return function pjax( req, res, next ) {
        if( req.header( 'X-PJAX' ) ) {
            req.pjax = true;
            res.locals.pjax = true;
        }
        next();
    };
};
