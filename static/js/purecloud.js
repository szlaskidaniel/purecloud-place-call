// **** Token Implicit Grant (Browser) - UserLogin ****
//let redirectUri = 'https://szlaskidaniel.github.io/purecloud-place-call/index.html';
let redirectUri = 'https://localhost/index.html';
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

client.setEnvironment("mypurecloud.ie");
client.setPersistSettings(true);


let apiInstance = new platformClient.ConversationsApi();

let myParams = {
    conversationId: getUrlVars()['conversationId'],
    participantId: getUrlVars()['participantId'],
    remoteNumber: getUrlVars()['remoteNumber'],    
};


// function login(_state) {

//     return new Promise(function (resolve, reject) {
//         // Authenticate
//         client.loginImplicitGrant("1b831a39-844c-4dce-9f7a-2ec29a88ddae", redirectUri , { state: _state })
//         .then((data) => {
//             // Make request to GET /api/v2/users/me?expand=presence
//             console.log('Logged-In');
//             console.log(data.state);
//             resolve(data.state);
//         })
//         .catch((err) => {
//         // Handle failure response
//             console.log(err);
//             reject();
//         });

//         //#endregion

//     });
// }


client.loginImplicitGrant("1b831a39-844c-4dce-9f7a-2ec29a88ddae", redirectUri, { state: myParams })
.then((data) => {
    // Make request to GET /api/v2/users/me?expand=presence
    console.log('Logged-In'); 
 
    if (data?.state?.conversationId) {
        myParams = data.state;
        document.getElementById("send").disabled = false;
        document.getElementById("cancel").disabled = false;
    };      
    console.log(myParams); 
})
.catch((err) => {
// Handle failure response
    console.log(err);    
});




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

async function consultTransfer() {
    console.log('consultTransfer');

    return new Promise(function (resolve, reject) {
        
        let body = {
            "speakTo": "BOTH",
            "destination": {
               "address": myParams.remoteNumber
            }
         }

        console.log('make consult', body);

        apiInstance.postConversationsCallParticipantConsult(myParams.conversationId, myParams.participantId, body)
        .then(async (data) => {

           
            console.log(`postConversationsCallParticipantConsult success! data: ${JSON.stringify(data, null, 2)}`);
            
            
            let currentParticipant = myParams.participantId;
            localStorage.setItem('participantId', currentParticipant);
           
           resolve();

          
        })
        .catch((err) => {
            console.log('There was a failure calling postConversationsCallParticipantConsult');
            console.error(err);
            reject("Failed to place a Call");
        });

    });
}

function consultTransferCancel() {
    console.log('consultTransferCancel')
    return new Promise(async function (resolve, reject) {
        
        let cachedParticipantId = localStorage.getItem('participantId');

        let tags = await getConversationIdsByExternalTag(myParams.conversationId);
        console.log(`recorder conversationIds ${tags}`);

         // Update Participant Attributes
         let attrs = {
            "attributes": {}
        }

        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            console.log(`tag ${tag}`);
            attrs.attributes[`extRecorderPath${i}`] = `https://apps.mypurecloud.ie/directory/#/engage/admin/interactions/${tag}/details`;
        }
                       
        console.log('attempt to patch ConversationParticipantAttributes for participantId', cachedParticipantId);

        apiInstance.patchConversationParticipantAttributes(myParams.conversationId, cachedParticipantId, attrs)
        .then(() => {
            console.log('patchConversationParticipantAttributes returned successfully.');
            
            apiInstance.deleteConversationsCallParticipantConsult(myParams.conversationId, cachedParticipantId)
            .then((data) => {
                console.log(`deleteConversationsCallParticipantConsult success! data: ${JSON.stringify(data, null, 2)}`);
                resolve();
            })
            .catch((err) => {
                console.log('There was a failure calling deleteConversationsCallParticipantConsult');
                console.error(err);
                reject("Failed to cancel transfer");
            });

        })
        .catch((err) => {
            console.log('There was a failure calling patchConversationParticipantAttributes');
            console.error(err);
            reject();
        });

        
       

    });
}


function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//#region Recorder Org

async function getConversationIdsByExternalTag(_aTagValue) {
    console.log('getConversationIdByExternalTag', _aTagValue);
    return new Promise(async (resolve, reject) => {
        try {
  
          await axios({
            url: `http://localhost:4000/getExternalTag?tag=${_aTagValue}`,
            method: 'GET',
            headers: {              
              'Content-Type': 'application/json',
            },
          })
            .then((response) => {
              console.log('Axios request succeeded.');                            
              resolve(response?.data?.remoteConversationIds);
            })
            .catch((error) => {
              reject(error);
            })
            .finally(() => {
              console.log('Axios request complete.');
            });
        } catch (error) {
          console.error('Error in try/catch: ' + JSON.stringify(error, null, 2));
          reject({
            response: {
              status: 500,
              statusText: 'Internal Server Error',
            },
          });
        } finally {
          console.log('Request complete.');
        }
      });
}
//#endregion
