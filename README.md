# Send SMS
This extension allow to be embedded into PureCloud interface and via SendSMS button send to the active caller SMS message directly from PureCloud.

## Installation steps
Follow below steps to enable this functionality in your org

* Create a new OAuth for SendSMS functionality (Token Implicit Grant)
* Set Authorized URIs to `https://szlaskidaniel.github.io/purecloud-send-sms/index.html`
* Copy created clientId.
* Create / reuse Inbound Script for Calls
* Add new WebComponent and set it's url to the `https://localhost/index.html?conversationId={{Scripter.Interaction ID}}&queueId={{Scripter.Queue ID}}&phoneNumber={{Scripter.Customer Formatted Number}}&clientId={{OauthClientId}}&environment={{env}}`
* Remember to replace `{{OauthClientId}}` to your `clientId` and `{{env}}` to your environment (mypurecloud.ie / mypurecloud.com)
* It's good that width of the image takes 100% of the window (notification messages) and heigh should be at least 200px.

### Temp solution, example link:
https://szlaskidaniel.github.io/purecloud-send-sms/index.html?conversationId=123&queueId=123&phoneNumber=+48509&clientId=6028cbef-64ec-4857-aa98-4f04360f83b0&environment=mypurecloud.ie