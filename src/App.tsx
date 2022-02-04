import React from 'react'
import {Provider} from "react-redux"
import store from './store'
// @ts-ignore
import ReduxToastr from 'react-redux-toastr'
import Styles from './styles'

// @ts-ignore
import {BrowserRouter as Router, Route, Routes, Redirect} from "react-router-dom"
import Main from "./pages/main"
// @ts-ignore
import Play from "./pages/play"

function App() {
  return (<Provider store={store}>
    <Styles/>
      <Router>
        <Routes>
          <Route path={"/"} element={<Main/>}/>
          <Route path={"/play"} element={<Play/>}/>
        </Routes>
      </Router>
      <ReduxToastr
        timeout={3000}
        newestOnTop={false}
        preventDuplicates
        position={"top-left"}
        getState={(state: any) => state.toastr}
        transitionIn="fadeIn"
        transitionOut="fadeOut"
        progressBar
        closeOnToastrClick/>

  </Provider>)
}

export default App
