const { CognitoIdentityProviderClient, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');
const USER_POOL_ID = 'us-west-2_SAazwJL7u';
const client = new CognitoIdentityProviderClient({ region: 'us-west-2' });

async function run() {
  try {
    const data = await client.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID }));
    console.log('SUCCESS! Number of users:', data.Users ? data.Users.length : 0);
    console.log('Users:', JSON.stringify(data.Users, null, 2));
  } catch (err) {
    console.error('ERROR FETCHING COGNITO USERS:', err);
  }
}
run();
