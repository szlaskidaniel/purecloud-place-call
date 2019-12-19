// **** Token Implicit Grant (Browser) - UserLogin ****
let redirectUri = 'https://szlaskidaniel.github.io/purecloud-place-call/index.html';
//redirectUri = 'https://localhost/index.html';
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

client.setEnvironment("mypurecloud.ie");
client.setPersistSettings(true);


let apiInstance = new platformClient.ConversationsApi();



// Authenticate
client.loginImplicitGrant("c65435ce-fe72-42af-a2d5-604c6016b487", redirectUri)
    .then(() => {
        // Make request to GET /api/v2/users/me?expand=presence
        console.log('Logged-In');

    })
    .catch((err) => {
        // Handle failure response
        console.log(err);
    });


//#endregion


function placeCall(aPhoneNumber, aQueueName) {
    console.log('postConversationsCalls')
    return new Promise(function (resolve, reject) {


        let body = {
            "phoneNumber": aPhoneNumber,
            "callFromQueueId": aQueueName           
        }

        apiInstance.postConversationsCalls(body)
            .then((data) => {
                console.log(`postConversationsCalls success! data: ${JSON.stringify(data, null, 2)}`);
                resolve();
            })
            .catch((err) => {
                console.log('There was a failure calling postConversationsCalls');
                console.error(err);
                reject("Failed to place a Call");
            });
    });
}