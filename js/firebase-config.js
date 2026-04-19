// ============================================================
//  FIREBASE CONFIGURATION
//  Fill in your project values to enable leaderboard & chat.
//
//  Setup steps:
//  1. Go to https://console.firebase.google.com/
//  2. Click "Add project", give it a name (e.g. "arcade")
//  3. Project Settings (gear icon) → General → Your apps → </> (Web)
//  4. Register the app, copy the firebaseConfig values below
//  5. In Firebase console: Build → Realtime Database → Create database
//     (Start in test mode, choose nearest region)
//  6. Build → Authentication → Get started → Anonymous → Enable
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBN5AVtTYIzEY_VUlcZbRfobBkYhxcFOmk",
  authDomain: "forfunstuff.firebaseapp.com",
  databaseURL: "https://forfunstuff-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "forfunstuff",
  storageBucket: "forfunstuff.firebasestorage.app",
  messagingSenderId: "172728910603",
  appId: "1:172728910603:web:63d646a62d119c8699d80e",
  measurementId: "G-QR664SYVDN"
};

// Paste these rules into Firebase console → Realtime Database → Rules:
/*
{
  "rules": {
    "leaderboard": {
      "$game": {
        ".read": true,
        "$uid": {
          ".write": "auth !== null && auth.uid === $uid"
        }
      }
    },
    "chat": {
      "messages": {
        ".read": true,
        ".write": "auth !== null",
        "$messageId": {
          ".validate": "newData.hasChildren(['uid','username','text','timestamp']) && newData.child('text').val().length <= 500"
        }
      }
    },
    "users": {
      "$uid": {
        ".read": true,
        ".write": "auth !== null && auth.uid === $uid"
      }
    }
  }
}
*/
