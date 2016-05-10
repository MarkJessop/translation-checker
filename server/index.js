"use strict"

let languageDocument = require('./languageDocument'),
    languageDocumentController = require('./languageDocumentController'),
    multer = require('multer'),
    storage = multer.memoryStorage(),
    upload = multer({ storage: storage }),
    path = require('path'),
    async = require('async');

let express = require('express'),
    app = express();

app.listen(3000, function () {
    console.log('Server listening on port 3000');
});


/****** ROUTE ******/

app.use("/",
    express.static(path.join(__dirname, "../"))
);
app.post('/translations',

    upload.single('languageDocument'),
    function initialize(req, res, next) {
        req.data = {
            'file': req.file,
            'translationPath': req.body.translationPath
        };
        next();
    },
    languageDocument.checkFileType,
    languageDocument.getLanguageDocumentString,
    languageDocument.processDocument,
    languageDocument.findTranslationSimilarities,
    languageDocumentController.sendTranslations,
    function handleErrors(err, req, res, next) {
        res.status(500).send({
            'message': err.message
        });
    }
);