"use strict";

var translationChecker = angular.module('translationChecker', []);

translationChecker.service('translastionDocumentService', function ($http) {
    this.getTranslation = (languageDocument) => {
        let fd = new FormData();
        fd.append('languageDocument', languageDocument.file);
        fd.append('translationPath', languageDocument.path);
        return $http.post('http://localhost:3000/translations', fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })
    }
});

translationChecker.controller('translationDocumentChecker', function (translastionDocumentService, $scope) {
    $scope.languageDocument = {};

    $scope.getTranslation = () => { 
        delete $scope.translations;
        delete $scope.translationError;
        translastionDocumentService.getTranslation($scope.languageDocument)
            .success((data) => {
                $scope.translations = data;
            })
            .error((error) => {
                $scope.translationError = error.message;
            })
    }
});

translationChecker.directive('fileModel', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
});
