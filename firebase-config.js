const firebaseConfig = {
    apiKey: "AIzaSyC-y0fjAJoiVcmHLjQxKvjsIjjrMm1gZfU",
    authDomain: "saleman-tracker.firebaseapp.com",
    projectId: "saleman-tracker",
    storageBucket: "saleman-tracker.appspot.com",
    messagingSenderId: "260738255348",
    appId: "1:260738255348:web:37f78324727600f78491a1",
    measurementId: "G-27MT198WLG"
  };
  
    firebase.initializeApp(firebaseConfig);
  
  const db = firebase.firestore();
  const storage = firebase.storage();
  const auth = firebase.auth();

