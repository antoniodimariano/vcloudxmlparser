# A simply XML parser for VMware vCloud Director body

work in progress



**Request**:

POST /trialcloud/verifyAgentInstallation


body:

    Content-Type: application/json; charset=utf-8


    {
	 
	       "ActivationToken": "b3FyV1YxeWNsb3FmUTlOOFFrVVJFbDhJM19oQW9oX3djb0lxQmxVMFhHM0xQYk83enB3T3hHR0dkZmxBRndpc0ZIQTg1aUxuNC11X3ZHbjFtSmV2dXFnRU94TnRvQ2FFSzNMRDNzcVBSa0E9"
    }
    
    

Response:

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "activated":true, 
        "ActivationToken": "b3FyV1YxeWNsb3FmUTlOOFFrVVJFbDhJM19oQW9oX3djb0lxQmxVMFhHM0xQYk83enB3T3hHR0dkZmxBRndpc0ZIQTg1aUxuNC11X3ZHbjFtSmV2dXFnRU94TnRvQ2FFSzNMRDNzcVBSa0E9"
    }