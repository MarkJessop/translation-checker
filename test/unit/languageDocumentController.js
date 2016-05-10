'use strict';

let chai = require('chai'),
    expect = chai.expect,
    languageDocumentController = require('../../server/languageDocumentController');

chai.use(require('chai-connect-middleware'));

describe("Language Document Controller", () => {

    it('should exist', () => {
        expect(languageDocumentController).to.not.be.null;
    });

    it('should have a sendTranslations function', () => {
        expect(languageDocumentController).to.have.a.property("sendTranslations")
            .which.is.a("function");
    });

    describe('#sendTranslations', () => {
        let data;
        before((done) => {
            chai.connect.use(languageDocumentController.sendTranslations)
                .req((req) => {
                    req.data = {
                        similarTranslations: 'similar translations'
                    };
                })
                .res((r) => {
                    r.send = (d) => {
                        data = d
                        done();
                    }
                })
                .dispatch();
        });

        it('should not throw an error', () => {
            expect(data).to.equal('similar translations');
        });
    });
});