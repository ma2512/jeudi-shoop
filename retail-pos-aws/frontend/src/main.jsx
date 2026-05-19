import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_0ky8mUdpE', 
      userPoolClientId: '687kvqb86o2mpsqqmrni8di5sv', // <--- ID Actualizado aquí
      loginWith: {
        email: true
      }
    }
  }
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
