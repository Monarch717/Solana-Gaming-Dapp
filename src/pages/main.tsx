import logo from "../assets/images/logo.png"
import React, {useEffect, useState} from "react"
import {getProvider, PhantomProvider} from "../utils"
import {clusterApiUrl, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Connection, Transaction} from "@solana/web3.js"
//@ts-ignore
import styled from "styled-components"
// @ts-ignore
import {toastr} from "react-redux-toastr"
import Container from "../components/Container"
// @ts-ignore
import Modal from "react-modal"
// @ts-ignore
import {useNavigate} from 'react-router-dom'
import {useDispatch, useSelector} from "react-redux"
import {setAddress, setCanPlay, setNickname as updateNickname} from "../slices/app"
import App from "../App"

Modal.setAppElement("#root")

const Main = () => {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined)
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(undefined)
  const [visibleNicknameModal, setVisibleNicknameModal] = useState<boolean>(false)
  const [nickname, setNickname] = useState<string>('')

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const AppData = useSelector((state: any) => state.app)

  // detect phantom provider exists
  useEffect(() => {
    const _provider = getProvider()

    if (_provider) setProvider(_provider)

    let _nickname = window.localStorage.getItem('nickname')
    if (_nickname) {
      setNickname('')
    }
  }, [])

  // prompts user to connect wallet if it exists
  const connectWallet = async () => {
    // @ts-ignore
    const {solana} = window
    try {
      const response = await solana.connect()
      console.log('wallet account', response.publicKey.toString())
      setWalletKey(response.publicKey.toString())
      toastr.success('Congratulation!', "Wallet connected")
      dispatch(setAddress(response.publicKey.toString()))
    } catch (e: any) {
      // { code: 4001, message: 'User rejected the request.' }
      console.log('error', e.message)
      toastr.error('Error', e.message)
    }
  }

  // disconnect phantom wallet
  const disconnectWallet = async () => {
    // @ts-ignore
    const {solana} = window

    if (walletKey && solana) {
      await (solana as PhantomProvider).disconnect()
      setWalletKey(undefined)
      dispatch(setAddress(""))
      toastr.success('Congratulation!', "Wallet disconnected")
    }
  }

  // request transaction
  const requestTransaction = async () => {
    try {
      // @ts-ignore
      const {solana} = window

      const network = clusterApiUrl('devnet')
      const connection = new Connection(network, 'confirmed')

      // @ts-ignore
      const fromPubKey = new PublicKey(walletKey.toString())
      const toPubkey = new PublicKey("HeZ3G67hdyhn1w8w6CN9i5duDvWondLPQhe4XZgu9NBw")

      // get recent block hash
      const {blockhash} = await connection.getRecentBlockhash()

      const transaction = new Transaction({
        recentBlockhash: blockhash, feePayer: fromPubKey
      })
      transaction.add(SystemProgram.transfer({
        fromPubkey: fromPubKey, toPubkey: toPubkey, lamports: LAMPORTS_PER_SOL * 0.05
      }))

      const {signature} = await solana.signAndSendTransaction(transaction)
      const res = await connection.confirmTransaction(signature)

      console.log("res", res)
      toastr.success('Congratulation!', "Payment succeeded")
      startGame()
    } catch (e: any) {
      console.log("error", e.message)
      toastr.error('Error!', e.message)
    }
  }

  const showKey = () => {
    return walletKey ? walletKey.toString().substr(0, 5) + '...' + walletKey.toString().substr(-5) : ''
  }

  const onPlay = () => {
    // requestTransaction();
    setVisibleNicknameModal(true)
  }

  const startGame = () => {
    dispatch(setCanPlay(true))
    navigate('/play')
  }

  const onNicknameOk = () => {
    if (nickname) {
      window.localStorage.setItem("nickname", nickname)
      requestTransaction()
      dispatch(updateNickname(nickname))
      setVisibleNicknameModal(false)
      // startGame()
    }
  }

  useEffect(() => {
    if (AppData.address) {
      setWalletKey(AppData.address)
    }
    if (AppData.nickname) {
      setNickname(AppData.nickname)
    }
  }, [])

  return (<Container className="App">
    <img src={logo} className="app-logo" alt="logo"/>
    {provider && !walletKey && (<button className={"flex-row alignItems-center justify-sb round-5 padding-5 bg-lighter white hover-info padding-left-20 padding-right-20"} onClick={connectWallet}>
      <svg xmlns="http://www.w3.org/2000/svg"
           className="icon icon-tabler icon-tabler-wallet" width="24"
           height="24"
           viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
           fill="none"
           strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12"></path>
        <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4"></path>
      </svg>
      Connect Wallet
    </button>)}
    {provider && walletKey && (<div className={"flex-column width-80 justify-center margin-vert-20"}>
      <div className={"full-width bold text-center font-size-36 shadow"}>Connected Account: {showKey()}</div>
      <div className={"full-width margin-top-10 flex-row justify-center"}>
        <button className={"round-5 margin-right-10 bg-primary bold white width-210px smooth hover-primary"} onClick={() => onPlay()}>PLAY</button>
        <button className={"round-5 padding-5 bg-danger bold white width-210px hover-danger"} onClick={disconnectWallet}>Disconnect</button>
      </div>
    </div>)}
    {!provider && (<p>No provider found. Install {" "}<a className="App-link" target={"_blank"} href={"https://phantom.app/"}>Phantom Browser Extension</a></p>)}
    <Modal
      isOpen={visibleNicknameModal}
      onRequestClose={() => setVisibleNicknameModal(false)}
      style={styleNicknameModal}>
      <div className={""}>Set your Nickname</div>
      <div className={"flex-row full-width bdbx"}>
        <input
          value={nickname}
          className={"width-80 round-10 border-width-1 border-white padding-10"}
          placeholder={"Challenger007"}
          onChange={(e: any) => {
            setNickname(e.target.value)
          }}
        />
        <button className={"round-10 width-20 margin-left-10 bg-info white hover-info"} onClick={onNicknameOk}>OK</button>
      </div>
    </Modal>
  </Container>)
}

export default Main

const styleNicknameModal = {
  content: {
    width: '400px', height: '100px', margin: 'auto', backgroundColor: "#282c34", fontSize: 36, borderRadius: 10
  }
}
