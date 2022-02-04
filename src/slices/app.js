import {createSlice} from "@reduxjs/toolkit"

const appSlice = createSlice({
  name: "app",
  initialState: {
    address: "",
    nickname: "",
    canPlay: false
  },
  reducers: {
    setAddress: (state, action) => {
      state.address=  action.payload
    },
    setNickname: (state, action) => {
      state.nickname = action.payload
    },
    setCanPlay: (state, action) => {
      state.canPlay = action.payload
    }
  }
})

export const reducer = appSlice.reducer
export const actions = appSlice.actions

export const  {
  setAddress,
  setNickname,
  setCanPlay
} = appSlice.actions

export default appSlice
