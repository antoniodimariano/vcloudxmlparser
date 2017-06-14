/**
 * Created by antonio_dimariano on 12/05/2017.
 */

module.exports = {


  vappDeploymentTasksObjectSchema: function () {
    return {
      "status": "",
      "startTime": "",
      "serviceNamespace": "",
      "operationName": "",
      "operation": "",
      "expiryTime": "",
      "cancelRequested": "",
      "name": "",
      "id": "",
      "type": "",
      "href": ""
    }
  },
  vappDeploymentVAppObjectSchema: function () {
    return {
      "xmlns": "",
      "ovfDescriptorUploaded": "",
      "deployed": "",
      "status": "",
      "name": "",
      "id": "",
      "type": "",
      "href": "",
      "xmlns:xsi": "",
      "xsi:schemaLocation": ""
    }
  }

}
