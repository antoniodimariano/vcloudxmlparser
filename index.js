/**
 * Created by antonio_dimariano on 11/05/2017.
 */

'use strict';

const xml2js = require('xml2js');

const parseFromFile = (file, next) => {
    const fs = require('fs');
    const parser = new xml2js.Parser();

    parser.addListener('end', function (result) {
        return next(result);
    });
    fs.readFile(__dirname + '/' + file, function (err, data) {
        if (err) {
            console.log("[parseFromFile][Error]", err);
            return next(false);
        }
        parser.parseString(data);
    });
}

const parseXMLandConvertToString = (xmlToParse) => {

    return new Promise((resolve, reject) => {
        let newparser = new xml2js.Parser().parseString;
        newparser(xmlToParse, function (error, result) {
            if (error) {
                console.log("[parseFromString][Error]", error);
                return reject(error);
            }
            else return resolve(result)
        })
    })

}

const convertStringToXML = (string) => {
    const builder = new xml2js.Builder();
    return new Promise((resolve) => {
        return resolve(builder.buildObject(string)); // it creates an object in any cases)
    })

}

const parsevCloudUserXML = (XMLbody) => {
    return new Promise((resolve, reject) => {

        parseXMLandConvertToString(XMLbody)
            .then((stringBody) => {
                let href = stringBody['User'].$.href;
                let splitedString = stringBody['User'].$.id.split(':user:');
                let userId = splitedString[1];
                let username = stringBody['User'].$.name;
                let return_userData = {
                    'username': username,
                    'href': href,
                    'userId': userId
                }
                return resolve(return_userData)
            })
            .catch((error) => {
                return reject({"error": err['Error']['$'].minorErrorCode})
            })

    })
}

module.exports = {
    parseFromFile: parseFromFile,
    parsevCloudUserXML: parsevCloudUserXML,
    convertStringToXML: convertStringToXML,
    parseXMLandConvertToString: parseXMLandConvertToString
}
