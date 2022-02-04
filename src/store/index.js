import {combineReducers} from "redux"
import {configureStore} from "@reduxjs/toolkit"
import {reducer as appReducer} from "../slices/app"
import thunk from "redux-thunk"
import {reducer as toastrReducer} from "react-redux-toastr"


const rootReducer = combineReducers({
  app: appReducer,
  toastr: toastrReducer
})


export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [],
      ignoredActionPaths: ['register', 'rehydrate'],
      ignoredPaths: []
    }
  }).concat(thunk)
})
