const COSE_Sign1_TAG = 18
const { cbor } = window

function toHexString(byteArray) {
  return Array.prototype.map
    .call(byteArray, function (byte) {
      return ('0' + (byte & 0xff).toString(16)).slice(-2)
    })
    .join('')
}

const prettyHeaderKey = (k) => {
  return { [`1`]: 'alg', [`3`]: 'ctyp', [`4`]: 'kid' }[`${k}`]
}

const prettyHeaderValue = (v) => {
  const value = { [`-7`]: '"ES256"', [`-35`]: '"ES384"', [`-36`]: '"ES512"' }[
    `${v}`
  ]
  return value ? value : `h'${toHexString(new TextEncoder().encode(v))}'`
}

const diagnosticProtectedHeader = (data) => {
  const decoded = cbor.decode(data, { dictionary: 'map' })
  const lines = []
  for (const [k, v] of decoded.entries()) {
    lines.push(`  #   "${prettyHeaderKey(k)}" : ${prettyHeaderValue(v)}`)
    lines.push(`  #   ${k} : ${v}`)
  }
  return `  # Protected Header
  h'${toHexString(data)}', 
  # {
${lines.join(',\n')}
  # }
`
}

const diagnosticData = (data) => {
  return `h'${toHexString(data)}'`
}

const diagnosticUnprotectedHeader = (decoded) => {
  if (!decoded.entries) {
    return '  # Unprotected Header\n  {},\n'
  }
  const lines = []
  for (const [k, v] of decoded.entries()) {
    lines.push(
      `    # "${prettyHeaderKey(k)}" : "${v}"    
      ${k} : ${prettyHeaderValue(v)} `
    )
  }
  return `  # Unprotected Header
  {
  ${lines.join(',\n')}
  },
`
}

export const alternateDiagnostic = async (data) => {
  let diagnostic = ''
  let { tag, value } = cbor.decode(data, { dictionary: 'map' })
  const unprotectedHeader = diagnosticUnprotectedHeader(value[1])

  diagnostic += `# COSE_Sign1\n${tag}([\n\n`
  diagnostic += diagnosticProtectedHeader(value[0])
  diagnostic += '\n'
  diagnostic += unprotectedHeader
  diagnostic += '\n'
  diagnostic += '  ' + '# Protected Payload\n'
  diagnostic += '  ' + diagnosticData(value[2]) + ',\n'
  diagnostic += '  ' + '# ' + new TextDecoder().decode(value[2]) + '\n'
  diagnostic += '\n'
  diagnostic += '  ' + '# Signature\n'
  diagnostic += '  ' + diagnosticData(value[3]) + '\n'
  diagnostic += `])`
  return diagnostic
}
