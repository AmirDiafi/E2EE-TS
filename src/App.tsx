import { useCallback, useState } from 'react'
import './App.css'
import { decryptText, encryptText } from './utils'

function App() {
  const [dericedKey, setDerivedKey] = useState<CryptoKey>()
  const sendMessage = useCallback(
    async (form: React.FormEvent<HTMLFormElement>) => {
      form.preventDefault()
      const formData = new FormData(form.target as HTMLFormElement)
      const data = Object.fromEntries(formData)
      const message = data.message as string
      console.log('original message-->', message)
      const encryptedMessage = await encryptText(message)
      console.log('encrypted message--->', encryptedMessage)
      const decryptedMessage = await decryptText(encryptedMessage)
      console.log('decrypted message--->', decryptedMessage)
    },
    []
  )
  return (
    <div className='App'>
      <h1>E2EE</h1>
      <form onSubmit={sendMessage}>
        <input type='text' name='message' />
        <input type='submit' value='Send' />
      </form>
    </div>
  )
}

export default App
