// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app"
import {getDatabase, ref, set, get, child} from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGgTksIp8h0RKhncTmYUDIZOlGfwbjw7Q",
  authDomain: "snake-494d4.firebaseapp.com",
  databaseURL: "https://snake-494d4-default-rtdb.firebaseio.com",
  projectId: "snake-494d4",
  storageBucket: "snake-494d4.appspot.com",
  messagingSenderId: "1028813489842",
  appId: "1:1028813489842:web:318e9828cd84fbdeaa2bab"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

const writeData = (payload) => {
  const {address, nickname, mode, score} = payload

  set(ref(database, `leaderboard-${mode}/${address}`), {
    nickname,
    mode,
    score,
    played_at: Date.now()
  }).then(() => {
    console.log('data saved')
  }).catch(e => console.log('write-ex', e.message))
}

const readData = async (mode) => {
  return new Promise(resolve => {
    const dbRef = ref(database)
    get(child(dbRef, `leaderboard-${mode}/`))
      .then(snapshot => {
        if (snapshot.exists()) {
          console.log(snapshot.val())
          resolve(snapshot.val())
        } else {
          console.log("No data available")
          resolve(null)
        }
      })
      .catch(e => {
        console.log("read-ex", e.message)
        resolve(undefined)
      })
  })
}

export default {
  writeData,
  readData
}
