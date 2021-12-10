var axios = require("axios").default;
var qs = require("qs");



// These settings should be set in a configuration file:
const API_CLIENT_ID = '<CLIENT_ID>';
const API_CLIENT_SECRET = '<CLIENT_SECRET>';
const AUTH_BASE_URL = "https://proid.exepron.com";
const API_BASE_URL = "https://api.exepron.com/api/v1";

// Exepron User Credentials
const exepronUserCredentials = { username: '<EXEPRON_USERNAME>', password: '<EXEPRON_PASSWORD>' }

// get the token using the username password of the client
logInIntoExepron(exepronUserCredentials).
// get the data that is required from exepron.
then(function (response) { getDataFromExepron(response); })


// this async function logs into Exepron with the credentials provided.
// it uses password authentication flow
async function  logInIntoExepron(credentials)
{
    const axiosConfig = {
        baseURL: AUTH_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    const requestData = {
        client_id: API_CLIENT_ID,
        client_secret: API_CLIENT_SECRET,
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
        scope: 'openid profile exepron.restapi'
    };
    
    try {
        // Send the parameters to the authentication server, and retrieve the token.
        const result = await axios.post('/connect/token', qs.stringify(requestData), axiosConfig);
        return result.data.access_token;
    } catch (err) {
        console.log('err', err);
    }
    
}


// this function retrieves the top 10 tasks in the account.
function getDataFromExepron(token) {
    // configure and assing the token received to the http request header
    const config = {
        baseURL: API_BASE_URL,
        headers: { Authorization: `Bearer ${token}` }
    };

    // Get The User id and the account Id I am querying about: 
    // EXEPRON API Supports OData so we can just query the fields that we want to see using the $select keyword:
    axios.get('/Accounts/Users/GetLoggedinUser?$select=userId,accountId', config)
    // get the top 10 tasks in the account, and user oData to retrieve only some of the properties of the Task entity. 
    .then(resp => {
        axios.get(`/Accounts/${resp.data[0].accountId}/Projects/-1/Tasks/GetAllTasks?$select=taskId,taskNumber,taskName,remainingDuration&$top=10`, config).then(resp => {
            // display the task entities in the console.
            console.log(resp);
            return (resp.data);
        });

    });
}