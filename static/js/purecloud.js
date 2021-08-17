// **** Token Implicit Grant (Browser) - UserLogin ****
//let redirectUri = 'https://szlaskidaniel.github.io/purecloud-place-call/index.html';
let redirectUri = 'https://localhost/index.html';
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

client.setEnvironment("mypurecloud.ie");
client.setPersistSettings(true);



const clientRecorder = platformClient.ApiClient.instance;
clientRecorder.setEnvironment("mypurecloud.ie");
clientRecorder.setPersistSettings(true);
let analyticsInstance = new platformClient.AnalyticsApi();




let apiInstance = new platformClient.ConversationsApi();

let myParams = {
    conversationId: getUrlVars()['conversationId'],
    participantId: getUrlVars()['participantId'],
    remoteNumber: getUrlVars()['remoteNumber'],    
};


function login(_state) {

    return new Promise(function (resolve, reject) {
        // Authenticate
        client.loginImplicitGrant("1b831a39-844c-4dce-9f7a-2ec29a88ddae", redirectUri , { state: _state })
        .then((data) => {
            // Make request to GET /api/v2/users/me?expand=presence
            console.log('Logged-In');
            console.log(data.state);
            resolve(data.state);
        })
        .catch((err) => {
        // Handle failure response
            console.log(err);
            reject();
        });

        //#endregion

    });
}


client.loginImplicitGrant("1b831a39-844c-4dce-9f7a-2ec29a88ddae", redirectUri, { state: myParams })
.then((data) => {
    // Make request to GET /api/v2/users/me?expand=presence
    console.log('Logged-In'); 

    console.log('Try to auth with Recorder')
    loginToRecorder();
    // clientRecorder.loginImplicitGrant("dfc691d6-d534-4334-8869-85e5b7a3dcfa", redirectUri)
    // .then ((data) => {
    //     console.log('Logged-In into Recorder');

    // }).catch((err) => {
    //     console.log(err);
    // });

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
    let tag = await getConversationIdByExternalTag(myParams.conversationId);
    console.log(`recorder conversationId ${tag}`);
    return new Promise(function (resolve, reject) {
        
        let body = {
            "speakTo": "BOTH",
            "destination": {
               "address": myParams.remoteNumber
            }
         }

        console.log('make consult', body);

        apiInstance.postConversationsCallParticipantConsult(myParams.conversationId, myParams.participantId, body)
        .then((data) => {
            console.log(`postConversationsCallParticipantConsult success! data: ${JSON.stringify(data, null, 2)}`);
            localStorage.setItem('participantId', myParams.participantId);
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
    return new Promise(function (resolve, reject) {
        
        let body = {}
        let cachedParticipantId = localStorage.getItem('participantId');
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


async function loginToRecorder() {
    console.log('loginToRecorder()');
  
    return new Promise(async (resolve, reject) => {
      try {
        await axios({
          url: 'https://login.mypurecloud.com',
          method: 'POST',
          headers: {
            Authorization: `Basic 598d45d1-57b5-4c73-8e84-1f0f95ffafb5:AS5Q_EeX3F7rpkibtuwz3EmwPnUTVz4NgZ1boynrvmU`,
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            console.log('Axios request succeeded.');
            resolve(response);
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
  };

async function getConversationIdByExternalTag(_aTagValue) {
    console.log('getConversationIdByExternalTag', _aTagValue);
    return new Promise(function (resolve, reject) {
        
            
    console.log('Query Analytics on separate Org');
    let body = 
    {
        "interval": "2021-08-16T22:00:00.000Z/2021-08-17T22:00:00.000Z",
        "order": "desc",
        "orderBy": "conversationStart",
        "paging": {
        "pageSize": 25,
        "pageNumber": 1
        },
        "segmentFilters": [
        {
        "type": "or",
        "predicates": [
        {
            "type": "dimension",
            "dimension": "participantName",
            "operator": "matches",
            "value": "Jan Botha"
        }
        ]
        }
        ]        
    }

    analyticsInstance.postAnalyticsConversationsDetailsQuery(body)
    .then((data) => {
        //console.log(`postAnalyticsConversationsDetailsQuery success! data: ${JSON.stringify(data, null, 2)}`);
        resolve(data?.conversations[0]?.conversationId);
    })
    .catch((err) => {
        console.log('There was a failure calling postAnalyticsConversationsDetailsQuery');
        console.error(err);
        reject();
    });

    });
}
//#endregion