
import * as pako from 'pako'
import * as jose from 'jose'

const prefix = `#pako:base64url:cbor:`

const Fragment = {
  set: async (data: Buffer) => {
    try {
      const compressed = await pako.deflate(new Uint8Array(data));
      const encoded = jose.base64url.encode(compressed)
      const fragment = `${prefix}${encoded}`
      return fragment
    } catch (e){
      return null
    }
    
  },
  get: async (hash: string) => {
    try{
      const encoded = hash.replace(prefix, '')
      const decoded = jose.base64url.decode(encoded)
      const expanded = await pako.inflate(decoded)
      return expanded
    } catch(e){
      return null
    }
  }
}

export default Fragment