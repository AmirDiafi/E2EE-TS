// Generate a Json Web key pairs if does not exists indeed.
const generateKeypairJwt = async () => {
  const keypair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  )
  return keypair
}

// Get Json Web keys
const getPublickeyJwk = async () => {
  const keypair = await generateKeypairJwt()
  const publicKeyJwk = await window.crypto.subtle.exportKey(
    'jwk',
    keypair.publicKey
  )
  return publicKeyJwk
}

const getPrivatekeyJwk = async () => {
  const keypair = await generateKeypairJwt()
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    'jwk',
    keypair.privateKey
  )
  return privateKeyJwk
}

// Get Private/Public keys
const getPublickey = async () => {
  const publicJsonWebKey = await getPublickeyJwk()
  const publicKey = await window.crypto.subtle.importKey(
    'jwk',
    publicJsonWebKey,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  )
  return publicKey
}

const getPrivatekey = async () => {
  const privateJsonWebKey = await getPrivatekeyJwk()
  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    privateJsonWebKey,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  )
  return privateKey
}

// Generate the secrete key [Derived key]
const generateDerivedKey = async () => {
  const publicKey = await getPublickey()
  const privateKey = await getPrivatekey()

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )

  return derivedKey
}

// Encrypt text
const encryptText = async (text: string) => {
  const derivedKey: CryptoKey = await generateDerivedKey()
  const encodedText = new TextEncoder().encode(text)

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: new TextEncoder().encode('Initialization Vector Random Text'),
    },
    derivedKey,
    encodedText
  )

  const uintArray = new Uint8Array(encryptedData)
  const string = String.fromCharCode.apply(null, uintArray)
  const base64Data = btoa(string)

  return base64Data
}

// Decrypt text
const decryptText = async (message: any) => {
  try {
    const derivedKey: CryptoKey = await generateDerivedKey()
    const text = message.base64Data
    const initializationVector = new Uint8Array(message.initializationVector)
      .buffer

    const string = atob(text)
    const uintArray = new Uint8Array(
      [...string].map((char) => char.charCodeAt(0))
    )
    const algorithm = {
      name: 'AES-GCM',
      iv: initializationVector,
    }

    const decryptedText = await window.crypto.subtle.decrypt(
      algorithm,
      derivedKey,
      uintArray
    )

    const decodedText = new TextDecoder().decode(decryptedText)
    return decodedText
  } catch (error) {
    return `error decrypting message: ${error}`
  }
}

export {
  generateKeypairJwt,
  generateDerivedKey,
  encryptText,
  decryptText,
  getPublickeyJwk,
  getPrivatekeyJwk,
}
