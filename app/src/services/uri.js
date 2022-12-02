const pako = require('pako');

const jose = require('jose');

function typedArrayToBuffer(array) {
  return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
}
const handleUriUpdate =  async (coseData) =>{
  const input = new Uint8Array(coseData);
  const output = pako.deflate(input);
  const compressed = jose.base64url.encode(output)
  const fragment = `pako:${compressed}`
  window.location.hash = fragment
}
const getCoseDataFromFragment = async (fragment)=>{
  const encodedCompressed = fragment.replace('#pako:', '')
  const decoded = jose.base64url.decode(encodedCompressed)
   const decompressed = pako.inflate(decoded);
  return  typedArrayToBuffer(decompressed)
}

const api = {
  handleUriUpdate,
  getCoseDataFromFragment
}

export default api