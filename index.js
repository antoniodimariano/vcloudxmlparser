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


/**
 * VAPP DEPLOYMENT
 * @type {{parseFromFile: ((p1:*, p2:*)), parsevCloudUserXML: ((p1?:*)), convertStringToXML: ((p1?:*)), parseXMLandConvertToString: ((p1?:*))}}
 */
const buildVappDeploymentTemplate = (XMLstring, vAppName, vdcHref, networkURI,baseVappTemplate) => {

    return new Promise((resolve, reject) => {
        this.parseXMLandConvertToString(XMLstring)
            .then((parsedString) => {
                return parsedString
            })
            .then((parsedString) => {
                return extractNetworkConfigFromVappTemplate(parsedString, networkURI)
            })
            .then((resultsConfig) => {
                return buildtheVappDeploymentTemplate(baseVappTemplate,resultsConfig[0].networkConfig, vAppName, vdcHref)
            })
            .then((vAppInitTemplate) => {
                return resolve(vAppInitTemplate)
            })
            .catch((error) => {
                return reject(error)
            })
    })
}


const extractNetworkConfigFromVappTemplate = (originalTemplate, orgHref) => {

    return new Promise((resolve, reject) => {
        const networkName = originalTemplate.VAppTemplate.NetworkConfigSection[0].NetworkConfig.map(elem => elem['$'].networkName)
        const featuresSection = originalTemplate.VAppTemplate.NetworkConfigSection[0].NetworkConfig.map((elem, index, array) => elem.Configuration[index].Features[index])
        const org = originalTemplate.VAppTemplate.NetworkConfigSection[0].NetworkConfig.map((elem, index, array) => {
                delete elem.Configuration[index].Features[index];
                delete elem.Configuration[index].ParentNetwork[index]['$'].name;
                elem.Configuration[index].ParentNetwork[0]['$'].href = orgHref
                return array
            }
        )
        let features = []
        features[features.length] = {"networkName": networkName, "features": featuresSection};
        let resultsConfig = []
        resultsConfig[resultsConfig.length] = {
            "networkConfig": originalTemplate.VAppTemplate.NetworkConfigSection[0],
            "features": features
        };
        delete resultsConfig[0].networkConfig['$'];
        return resolve(resultsConfig)
    })
}
const buildtheVappDeploymentTemplate = (baseVappTemplate, networkConfig, vAppName, vdcHref) => {
    if (!baseVappTemplate) return new Promise((resolve, reject) => reject({error: 'Please specify an initial base Vapp Template'}))

    return new Promise((resolve, reject) => {
        this.parseXMLandConvertToString(baseVappTemplate)
            .then((vAppTemplate) => {
                vAppTemplate.InstantiateVAppTemplateParams.InstantiationParams[0].NetworkConfigSection[0] = networkConfig;
                vAppTemplate.InstantiateVAppTemplateParams.Source[0]['$'].href = vdcHref;
                vAppTemplate.InstantiateVAppTemplateParams['$'].name = vAppName;
                return vAppTemplate
            })
            .then((vappTemplate) => {
                return resolve(this.convertStringToXML(vappTemplate))
            })
            .catch((error) => {
                return reject(error)
            })
    })
}


module.exports = {
    parseFromFile: parseFromFile,
    parsevCloudUserXML: parsevCloudUserXML,
    convertStringToXML: convertStringToXML,
    parseXMLandConvertToString: parseXMLandConvertToString,

    buildVappDeploymentTemplate:buildVappDeploymentTemplate
}
