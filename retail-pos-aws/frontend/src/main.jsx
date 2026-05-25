import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_SAazwJL7u', 
      userPoolClientId: '4u81010p7vri9a6g7749k8n491',
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
