import CryptoJS from 'crypto-js'

export const encrypt = (text, masterPassword) => {
  return CryptoJS.AES.encrypt(text, masterPassword).toString()
}

export const decrypt = (ciphertext, masterPassword) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, masterPassword)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    return ''
  }
}

export const generatePassword = (length = 16, options = {}) => {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options

  let chars = ''
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (numbers)   chars += '0123456789'
  if (symbols)   chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  if (!chars)    chars  = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (n) => chars[n % chars.length]).join('')
}

export const passwordStrength = (pwd) => {
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (pwd.length >= 16) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { label: 'Très faible', width: '20%'  }
  if (score <= 2) return { label: 'Faible',      width: '40%'  }
  if (score <= 4) return { label: 'Moyen',       width: '60%'  }
  if (score <= 5) return { label: 'Fort',        width: '80%'  }
  return           { label: 'Très fort',   width: '100%' }
}
