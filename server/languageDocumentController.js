"use strict"
module.exports = (() => {
    return {
        'sendTranslations': (req, res) => {
            res.send(req.data.similarTranslations);
        }
    }
})();