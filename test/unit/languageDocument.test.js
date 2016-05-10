'use strict';

let chai = require('chai'),
  expect = chai.expect,
  languageDocument = require('../../server/languageDocument');

chai.use(require('chai-connect-middleware'));

describe("Language Document", () => {

  it('should exist', () => {
    expect(languageDocument).to.not.be.null;
  });

  it('should have a checkFileType function', () => {
    expect(languageDocument).to.have.a.property("checkFileType")
      .which.is.a("function");
  });

  it('should have a getLanguageDocumentString function', () => {
    expect(languageDocument).to.have.a.property("getLanguageDocumentString")
      .which.is.a("function");
  })
  it('should have a processDocument function', () => {
    expect(languageDocument).to.have.a.property("processDocument")
      .which.is.a("function");
  });

  it('should have a findTranslationSimilarities function', () => {
    expect(languageDocument).to.have.a.property("findTranslationSimilarities")
      .which.is.a("function");
  });

  describe('#checkFileType', () => {
    describe('Working', () => {
      let error;
      before((done) => {
        chai.connect.use(languageDocument.checkFileType)
          .req((req) => {
            req.data = {
              file: {
                mimetype: 'text/xml'
              }
            };
          })
          .next((e) => {
            error = e;
            done();
          })
          .dispatch();
      });

      it('should not throw an error', () => {
        expect(error).to.not.exist;
      });
    });
    describe('Broken - bad file type', () => {
      let error;
      before((done) => {
        chai.connect.use(languageDocument.checkFileType)
          .req((req) => {
            req.data = {
              file: {
                mimetype: 'application/json'
              }
            };
          })
          .next((e) => {
            error = e;
            done();
          })
          .dispatch();
      });

      it('should throw an error with a message', () => {
        expect(error).to.exist;
        expect(error).to.have.a.property('message', 'Only XML documents are accepted');
      });
    });
  });

  describe('#getLanguageDocumentString', () => {
    let req;
    before((done) => {
      chai.connect.use(languageDocument.getLanguageDocumentString)
        .req((r) => {
          r.file = {
            buffer: new Buffer('<test>')
          };
          r.data = {};
          req = r;
        })
        .next(() => {
          done();
        })
        .dispatch();
    });

    it('should populate req.data.languageDocument', () => {
      expect(req.data.languageDocument).to.equal('<test>');
    });
  });

  describe('#processDocument', () => {
    describe('Working', () => {

      let xmlDoc = '<root><translate><word1>mot un</word1></translate></root>',
        error, req;
      before((done) => {
        chai.connect.use(languageDocument.processDocument)
          .req((r) => {
            r.data = {
              languageDocument: xmlDoc,
              translationPath: 'root.translate'
            };
            req = r;
          })
          .next((e) => {
            error = e;
            done();
          })
          .dispatch();
      });

      it('should not return an error', () => {
        expect(error).to.be.undefined;
      });

      it('should return a the translations in JSON', () => {
        expect(req.data.languageObject).to.have.a.property('word1', 'mot un');
      });
    });

    describe('Broken - XML parser throws an error', () => {
      let brokenXmlDoc = '<root><translate><word1>mot un</word1></root>',
        error;
      before((done) => {
        chai.connect.use(languageDocument.processDocument)
          .req((r) => {
            r.data = {
              languageDocument: brokenXmlDoc,
              translationPath: 'root.translate'
            };
          })
          .next((e) => {
            error = e;
            done();
          })
          .dispatch();
      });

      it('should return an error', () => {
        expect(error).to.exist
      });

    });

    describe('Broken - Unable to find translation', () => {
      let brokenXmlDoc = '<root><translate><word1>mot un</word1></translate></root>',
        path = 'root.deeper.translate',
        error;
      before((done) => {
        chai.connect.use(languageDocument.processDocument)
          .req((r) => {
            r.data = {
              languageDocument: brokenXmlDoc,
              translationPath: path
            };
          })
          .next((e) => {
            error = e;
            done();
          })
          .dispatch();
      });

      it('should return an error', () => {
        expect(error).to.exist;
      });

      it('should return a message about the translation path', () => {
        expect(error).to.have.a.property('message', 'Unable to find translations under the path ' + path);
      })
    });
  });

  describe('#findTranslationSimilarities', () => {
    describe('Find similarities', () => {
      let languageObject = {
        'word1': 'hello',
        'word2': 'goodbye',
        'word3': 'goodbyes'
      }, req;
      before((done) => {
        chai.connect.use(languageDocument.findTranslationSimilarities)
          .req((r) => {
            r.data = {
              languageObject: languageObject
            }
            req = r;
          })
          .next(() => {
            done();
          })
          .dispatch();
      });

      it('should retain the value of the original translation', () => {
        expect(req.data.similarTranslations).to.have.a.property('word2')
        expect(req.data.similarTranslations['word2']).to.have.a.property('value', 'goodbye');
      });

      it('should contain an array of similar translations', () => {
        expect(req.data.similarTranslations['word2'])
          .to.have.property('similarities')
          .which.is.an('Array')
          .with.a.lengthOf(1);
        expect(req.data.similarTranslations['word2'].similarities[0])
          .to.have.a.property('token', 'word3');
        expect(req.data.similarTranslations['word2'].similarities[0])
          .to.have.a.property('translation', req.data.languageObject['word3']);
      });
    });

    describe('No similarties', () => {
      let languageObject = {
        'word1': 'hello',
        'word2': 'goodbye',
        'word3': 'there'
      }, req;
      before((done) => {
        chai.connect.use(languageDocument.findTranslationSimilarities)
          .req((r) => {
            r.data = {
              languageObject: languageObject
            }
            req = r;
          })
          .next(() => {
            done();
          })
          .dispatch();
      });
      it('should not find any similarities', () => {
        let similarTokens = Object.keys(req.data.similarTranslations);
        expect(similarTokens).to.have.a.lengthOf(0);
      });
    });
  });
});