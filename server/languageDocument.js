let fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    xmlParser = require('xml2json'),
    stringSimilarity = require('string-similarity'),
    async = require('async');

module.exports = (() => {
    let fileTypes = ['text/xml']

    return {

        'checkFileType': (req, res, next) => {
            let fileType = req.data.file.mimetype;
            if (fileTypes.indexOf(fileType) === -1) {
                return next(new Error('Only XML documents are accepted'))
            }
            next();
        },
        'getLanguageDocumentString': (req, res, next) => {
            req.data.languageDocument = req.file.buffer.toString();
            next();
        },

        // Process document from a stringified XML document to a JSON object
        // Return only the translation part fo the JSON object
        'processDocument': (req, res, next) => {
            let pathToTranslationElement = req.data.translationPath;
            async.waterfall([
                (cb) => {
                    cb(null, req.data.languageDocument, pathToTranslationElement);
                },
                parseDocument,
                findTranslations
            ],
                (error, translations) => {
                    req.data.languageObject = translations;
                    next(error);
                });

        },

        'findTranslationSimilarities': (req, res, next) => {
            let similar = {},
                foundSimilarities = [];

            Object.keys(req.data.languageObject).forEach((languageToken) => {

                // For each language token, check to see if there's a potential smiliarity in the language strings
                Object.keys(req.data.languageObject).forEach((nestedLanguageToken) => {
                    if (languageToken !== nestedLanguageToken && foundSimilarities.indexOf(nestedLanguageToken) === -1) {
                        let similarity = stringSimilarity.compareTwoStrings(req.data.languageObject[languageToken], req.data.languageObject[nestedLanguageToken])

                        // if a match is found, save the tokens and value
                        if (similarity >= 0.8) {
                            similar[languageToken] = similar[languageToken] || {
                                'value': req.data.languageObject[languageToken],
                                'similarities': []
                            }
                            let similarString = {
                                "token": nestedLanguageToken,
                                "translation": req.data.languageObject[nestedLanguageToken]
                            }
                            similar[languageToken].similarities.push(similarString);

                            // put found similarities into their own array so that we don't records
                            // duplicate results
                            foundSimilarities.push(languageToken);
                            foundSimilarities.push(nestedLanguageToken);
                        }
                    }
                });
            });

            req.data.similarTranslations = similar;

            next()
        }
    }

})();

/**** Private functions *******/

// parse a stringified XML document
function parseDocument(xmlDoc, pathToTranslationElement, callback) {
    let parsedDocument;

    try {
        parsedDocument = JSON.parse(xmlParser.toJson(xmlDoc));
    } catch (e) {
        return callback(new Error(e));
    }
    callback(null, parsedDocument, pathToTranslationElement);
}

// using the passed in path to translation, find the language object
function findTranslations(parsedDocument, pathToTranslationElement, callback) {
    let error;
    let translations = _.get(parsedDocument, pathToTranslationElement);
    if (_.isEmpty(translations)) {
        error = new Error('Unable to find translations under the path ' + pathToTranslationElement);
    }
    return callback(error, translations);
}