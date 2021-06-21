module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        if(err.toLowerCase().endsWith("not found")) return res.status(404).json({message: err});
        if(err == "UnauthorizedError") return res.status(401).json({ message: 'Invalid token or token has expired' });
        if(err.toLowerCase().startsWith("no permissions")) return res.status(403).json({message: err});
        return res.status(400).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Invalid token or token has expired' });
    }

    // default to 500 server error
    return res.status(500).json({ message: err.message });
}