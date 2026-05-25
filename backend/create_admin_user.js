/**
 * Script para asignar el rol de Administrador a un usuario en AWS Cognito.
 * 
 * Uso:
 *   node create_admin_user.js <email_o_nombre_usuario>
 * 
 * Ejemplo:
 *   node create_admin_user.js maria@example.com
 */

require('dotenv').config();
const { 
  CognitoIdentityProviderClient, 
  AdminAddUserToGroupCommand,
  CreateGroupCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const USER_POOL_ID = 'us-west-2_SAazwJL7u';
const REGION = 'us-west-2';

// Argumento: usuario o correo
const username = process.argv[2];

if (!username) {
  console.error('❌ Por favor, proporciona el nombre de usuario o correo electrónico.');
  console.log('Ejemplo de uso: node create_admin_user.js usuario@correo.com');
  process.exit(1);
}

// El SDK de AWS detectará de forma automática las variables de entorno AWS_ACCESS_KEY_ID 
// y AWS_SECRET_ACCESS_KEY configuradas en el sistema o leídas de tu archivo .env
const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION
});

async function main() {
  console.log(`⏳ Creando o asegurando grupo 'Admin' en el User Pool...`);
  try {
    await cognitoClient.send(new CreateGroupCommand({
      UserPoolId: USER_POOL_ID,
      GroupName: 'Admin',
      Description: 'Grupo para administradores de Jeudi Shop'
    }));
    console.log(`✅ Grupo 'Admin' creado o ya existente.`);
  } catch (err) {
    if (err.name === 'GroupExistsException') {
      console.log(`ℹ️ El grupo 'Admin' ya existe.`);
    } else {
      console.error(`❌ Error al crear grupo 'Admin':`, err.message);
    }
  }

  console.log(`⏳ Asignando usuario '${username}' al grupo 'Admin'...`);
  try {
    await cognitoClient.send(new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: username.trim(),
      GroupName: 'Admin'
    }));
    console.log(`🎉 ¡Éxito! El usuario '${username}' ahora tiene el rol de Administrador (Admin).`);
  } catch (err) {
    console.error(`❌ Error al asignar el rol al usuario:`, err.message);
    console.log('\n💡 Tip: Asegúrate de que el usuario ya se haya registrado en la tienda antes de asignarle el rol.');
  }
}

main();
