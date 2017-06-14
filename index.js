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


const validateVappDeploymentObject = (VappXMLPayload) => {

    const helpers = require('./helpers/validation');
    const payload = require('./helpers/payloadFactory')

    console.log(helpers.compareObjectSchema(VappXMLPayload.VApp.Tasks[0].Task[0]['$'], payload.vappDeploymentTasksObjectSchema()))
    console.log(helpers.compareObjectSchema(VappXMLPayload.VApp['$'], payload.vappDeploymentVAppObjectSchema()))

    if (!helpers.compareObjectSchema(VappXMLPayload.VApp.Tasks[0].Task[0]['$'], payload.vappDeploymentTasksObjectSchema()) ||
        !helpers.compareObjectSchema(VappXMLPayload.VApp['$'], payload.vappDeploymentVAppObjectSchema())) {
        return false;
    }
    else return true;
}


/**
 * VAPP DEPLOYMENT
 * @type {{parseFromFile: ((p1:*, p2:*)), parsevCloudUserXML: ((p1?:*)), convertStringToXML: ((p1?:*)), parseXMLandConvertToString: ((p1?:*))}}
 */
const buildVappDeploymentTemplate = (XMLstring, vAppName, vdcHref, networkURI, baseVappTemplate) => {

    return new Promise((resolve, reject) => {
        this.parseXMLandConvertToString(XMLstring)
            .then((parsedString) => {
                return parsedString
            })
            .then((parsedString) => {
                return extractNetworkConfigFromVappTemplate(parsedString, networkURI)
            })
            .then((resultsConfig) => {
                return buildtheVappDeploymentTemplate(baseVappTemplate, resultsConfig[0].networkConfig, vAppName, vdcHref)
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
    buildVappDeploymentTemplate: buildVappDeploymentTemplate
}

let totest = {
    "VApp": {
        "$": {
            "xmlns": "http://www.vmware.com/vcloud/v1.5",
            "ovfDescriptorUploaded": "true",
            "deployed": "false",
            "status": "0",
            "name": "sps_vapp_190p0llll6oo9",
            "id": "urn:vcloud:vapp:484e63ae-a22d-4710-ba58-c33c0c2b4885",
            "type": "application/vnd.vmware.vcloud.vApp+xml",
            "href": "https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-484e63ae-a22d-4710-ba58-c33c0c2b4885",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.vmware.com/vcloud/v1.5 http://api-edc2.productcloud.trendmicro.com/api/v1.5/schema/master.xsd"
        },
        "Link": [{
            "$": {
                "rel": "down",
                "type": "application/vnd.vmware.vcloud.vAppNetwork+xml",
                "name": "vAppNet-vAppNet-vapp-network",
                "href": "https://api-edc2.productcloud.trendmicro.com/api/network/fa31055c-29dc-4ea1-865f-01fdb64364b7"
            }
        }, {
            "$": {
                "rel": "down",
                "type": "application/vnd.vmware.vcloud.controlAccess+xml",
                "href": "https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-484e63ae-a22d-4710-ba58-c33c0c2b4885/controlAccess/"
            }
        }, {
            "$": {
                "rel": "up",
                "type": "application/vnd.vmware.vcloud.vdc+xml",
                "href": "https://api-edc2.productcloud.trendmicro.com/api/vdc/decce037-5b9a-4de0-87f0-18baa9e2b0d2"
            }
        }, {
            "$": {
                "rel": "down",
                "type": "application/vnd.vmware.vcloud.owner+xml",
                "href": "https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-484e63ae-a22d-4710-ba58-c33c0c2b4885/owner"
            }
        }, {
            "$": {
                "rel": "down",
                "type": "application/vnd.vmware.vcloud.metadata+xml",
                "href": "https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-484e63ae-a22d-4710-ba58-c33c0c2b4885/metadata"
            }
        }, {
            "$": {
                "rel": "ovf",
                "type": "text/xml",
                "href": "https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-484e63ae-a22d-4710-ba58-c33c0c2b4885/ovf"
            }
        }, {
            "$": {
                "rel": "down",
                "type": "application/vnd.vmware.vcloud.productSections+xml",
                "href": "https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-484e63ae-a22d-4710-ba58-c33c0c2b4885/productSections/"
            }
        }],
        "Description": [""],
        "Tasks": [{
            "Task": [{
                "$": {
                    "status": "running",
                    "startTime": "2017-05-12T15:57:14.375+02:00",
                    "serviceNamespace": "com.vmware.vcloud",
                    "operationName": "vdcInstantiateVapp",
                    "operation": "Creating Virtual Application sps_vapp_190p0llll6oo9(484e63ae-a22d-4710-ba58-c33c0c2b4885)",
                    "expiryTime": "2017-06-11T15:57:14.375+02:00",
                    "cancelRequested": "false",
                    "name": "task",
                    "id": "urn:vcloud:task:6dfea40a-97e4-4dac-a61a-bfb6f330f296",
                    "type": "application/vnd.vmware.vcloud.task+xml",
                    "href": "https://api-edc2.productcloud.trendmicro.com/api/task/6dfea40a-97e4-4dac-a61a-bfb6f330f296"
                },
                "Link": [{
                    "$": {
                        "rel": "task:cancel",
                        "href": "https://api-edc2.productcloud.trendmicro.com/api/task/6dfea40a-97e4-4dac-a61a-bfb6f330f296/action/cancel"
                    }
                }],
                "Owner": [{
                    "$": {
                        "type": "application/vnd.vmware.vcloud.vApp+xml",
                        "name": "sps_vapp_190p0llll6oo9",
                        "href": "https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-484e63ae-a22d-4710-ba58-c33c0c2b4885"
                    }
                }],
                "User": [{
                    "$": {
                        "type": "application/vnd.vmware.admin.user+xml",
                        "name": "admin_trial_test",
                        "href": "https://api-edc2.productcloud.trendmicro.com/api/admin/user/52327b5b-0ffc-45d9-930b-9aead15558e5"
                    }
                }],
                "Organization": [{
                    "$": {
                        "type": "application/vnd.vmware.vcloud.org+xml",
                        "name": "trial-test",
                        "href": "https://api-edc2.productcloud.trendmicro.com/api/org/d59183d5-d7fe-4a3a-985c-10c8509f7673"
                    }
                }],
                "Progress": ["1"],
                "Details": [""]
            }]
        }],
        "DateCreated": ["2017-05-12T15:57:11.037+02:00"],
        "Owner": [{
            "$": {"type": "application/vnd.vmware.vcloud.owner+xml"},
            "User": [{
                "$": {
                    "type": "application/vnd.vmware.admin.user+xml",
                    "name": "admin_trial_test",
                    "href": "https://api-edc2.productcloud.trendmicro.com/api/admin/user/52327b5b-0ffc-45d9-930b-9aead15558e5"
                }
            }]
        }],
        "InMaintenanceMode": ["false"]
    }
}


/*
var data = '<?xml version="1.0" encoding="UTF-8"?> <QueryResultRecords xmlns="http://www.vmware.com/vcloud/v1.5" total="5" pageSize="1" page="2" name="vApp" type="application/vnd.vmware.vcloud.query.records+xml" href="https://api-edc2.productcloud.trendmicro.com/api/query?type=vApp&amp;page=2&amp;pageSize=1&amp;format=records" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.vmware.com/vcloud/v1.5 http://api-edc2.productcloud.trendmicro.com/api/v1.5/schema/master.xsd"> <Link rel="firstPage" type="application/vnd.vmware.vcloud.query.records+xml" href="https://api-edc2.productcloud.trendmicro.com/api/query?type=vApp&amp;page=1&amp;pageSize=1&amp;format=records"/> <Link rel="previousPage" type="application/vnd.vmware.vcloud.query.records+xml" href="https://api-edc2.productcloud.trendmicro.com/api/query?type=vApp&amp;page=1&amp;pageSize=1&amp;format=records"/> <Link rel="nextPage" type="application/vnd.vmware.vcloud.query.records+xml" href="https://api-edc2.productcloud.trendmicro.com/api/query?type=vApp&amp;page=3&amp;pageSize=1&amp;format=records"/> <Link rel="lastPage" type="application/vnd.vmware.vcloud.query.records+xml" href="https://api-edc2.productcloud.trendmicro.com/api/query?type=vApp&amp;page=5&amp;pageSize=1&amp;format=records"/> <Link rel="alternate" type="application/vnd.vmware.vcloud.query.references+xml" href="https://api-edc2.productcloud.trendmicro.com/api/query?type=vApp&amp;page=2&amp;pageSize=1&amp;format=references"/> <Link rel="alternate" type="application/vnd.vmware.vcloud.query.idrecords+xml" href="https://api-edc2.productcloud.trendmicro.com/api/query?type=vApp&amp;page=2&amp;pageSize=1&amp;format=idrecords"/> <VAppRecord vdcName="trial-test" vdc="https://api-edc2.productcloud.trendmicro.com/api/vdc/decce037-5b9a-4de0-87f0-18baa9e2b0d2" status="POWERED_ON" ownerName="system" name="WFBS team QA 1" isPublic="false" isInMaintenanceMode="false" isExpired="false" isEnabled="true" isDeployed="true" isBusy="false" creationDate="2017-06-13T05:30:58.467+02:00" href="https://api-edc2.productcloud.trendmicro.com/api/vApp/vapp-21ef05a0-8f79-4adc-8ab6-b9ac98625926" cpuAllocationMhz="4" cpuAllocationInMhz="4000" task="https://api-edc2.productcloud.trendmicro.com/api/task/7f188bf6-5212-45d2-b1b3-b26bef07205c" isAutoDeleteNotified="true" numberOfVMs="2" autoUndeployDate="2017-07-13T05:36:36.690+02:00" isAutoUndeployNotified="false" taskStatusName="vappDeploy" isVdcEnabled="true" honorBootOrder="true" pvdcHighestSupportedHardwareVersion="10" lowestHardwareVersionInVApp="10" taskStatus="success" storageKB="54525952" taskDetails=" " numberOfCpus="4" memoryAllocationMB="8192"/> </QueryResultRecords>'
 parseXMLandConvertToString(data)
     .then((converted)=>{
    console.log("Converted:",converted.QueryResultRecords['$'].total)
     })

*/

