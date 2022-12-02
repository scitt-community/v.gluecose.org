// Based on https://raw.githubusercontent.com/gluecose/cose-viewer/main/src/index.js

import * as CBOR from "cbor-redux";
import * as jose from 'jose'

// const Buffer = require('buffer/').Buffer 

const COSE_Sign1_TAG = 18;

function typedArrayToBuffer(array) {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
}

const CoseAlgs = new Map([
    [-7,  "ES256"],
    [-35, "ES384"],
    [-36, "ES512"],
    [-37, "PS256"],
    [-38, "PS384"],
    [-39, "PS512"],
    [-16, "SHA-256"],
    [-43, "SHA-384"],
    [-44, "SHA-512"],
]);


function prettyKid(val) {
    // TODO check if tstr within bstr
    // return prettyUnknown(val);
    return new TextDecoder().decode(val)
}


function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function prettyBstrHex(val) {
    return `<${val.byteLength} bytes: ${toHexString(val)}>`;
}


function prettyUnknown(val) {
    let prettyValue
    if (ArrayBuffer.isView(val)) {
        prettyValue = prettyBstrHex(val);
    } else if (typeof val == "string") {
        prettyValue = val;
    } else if (typeof val == "number") {
        prettyValue = val.toString();
    } else if (val.tag) {
        prettyValue = `Tag(${val.tag}) ${prettyUnknown(val.value)}`;
    } else {
        prettyValue = `<no pretty value: ${typeof val}>`;
    }
    return prettyValue
}

function prettyAlg(val) {
    if (CoseAlgs.has(val)) {
        return CoseAlgs.get(val)
        // return `${val} (${CoseAlgs.get(val)})`;
    } else {
        return prettyUnknown(val);
    }
}

function prettyCrit(val) {
    return "[" + val.map(prettyUnknown).join(", ") + "]";
}

function prettyContentType(val) {
    return prettyUnknown(val);
}

function prettyCounterSignature(val) {
    // TODO details
    return "<counter signature>";
}

function toBase64(byteArray) {
    return jose.base64url.encode(byteArray);
}

function prettyBstrBase64(val) {
    return `<${val.byteLength} bytes: ${toBase64(val)}>`;
}

function prettyCoseX509(val) {
    if (Array.isArray(val)) {
        return "[" + val.map(prettyBstrBase64).join(", ") + "]";
    } else {
        return prettyBstrBase64(val);
    }
}

const HeaderMapping = new Map([
    [1, ["alg", prettyAlg ]],
    [2, ["crit", prettyCrit ]],
    [3, ["ctyp", prettyContentType ]],
    [4, ["kid", prettyKid ]],
    [5, ["IV", prettyBstrHex ]],
    [6, ["Partial IV", prettyBstrHex ]],
    [7, ["counter signature", prettyCounterSignature ]],
    [9, ["CounterSignature0", prettyBstrHex ]],
    [10, ["kid context", prettyBstrHex ]],
    [32, ["x5bag", prettyCoseX509 ]],
    [33, ["x5chain", prettyCoseX509 ]],
    [34, ["x5t", prettyCoseCertHash ]],
    [35, ["x5u", prettyString ]],
]);

function prettyCoseCertHash(val) {
    const [hashAlg, hashValue ] = val;
    return `[${prettyAlg(hashAlg)}, ${prettyBstrHex(hashValue)}]`;
}

function prettyString(val) {
    return `"${val}"`;
}

const prettyHeader = (header)=>{
    const headerObj = {}
    for (const [key, value] of header) {
        if (HeaderMapping.has(key)) {
            const [name, prettyFn] = HeaderMapping.get(key);
            headerObj[name] = prettyFn(value)
        
        } else {
            headerObj[key] = prettyUnknown(value)
          
        }
    }
    return headerObj
}

function decodeCOSESign1(buf) {
    let msg;
    try {
        msg = CBOR.decode(buf, null, { dictionary: "map" });
    } catch (e) {
        console.log(e);
        throw new Error("Not a COSE_Sign1 message: CBOR decode error");
    }
    if (msg.tag) {
        if (msg.tag !== COSE_Sign1_TAG) {
            throw new Error("Not a COSE_Sign1 message: invalid tag");
        }
        msg = msg.value;
    }
    if (!Array.isArray(msg) || msg.length !== 4) {
        throw new Error("Not a COSE_Sign1 message: not an array of length 4");
    }
    const protectedHeader = msg[0];
    const unprotectedHeader = msg[1];
    const payload = msg[2];
    const signature = msg[3];
    if (!ArrayBuffer.isView(protectedHeader)) {
        throw new Error("Not a COSE_Sign1 message: protected header not wrapped in bstr");
    }
    const phdrBuf = typedArrayToBuffer(protectedHeader);
    const phdrMap = CBOR.decode(phdrBuf, null, { dictionary: "map" });
    if (!(phdrMap instanceof Map)) {
        throw new Error("Not a COSE_Sign1 message: protected header not a map");
    }
    if (!(unprotectedHeader instanceof Map)) {
        throw new Error("Not a COSE_Sign1 message: unprotected header not a map");
    }
    if (!ArrayBuffer.isView(payload)) {
        throw new Error("Not a COSE_Sign1 message: payload not a bstr");
    }
    if (!ArrayBuffer.isView(signature)) {
        throw new Error("Not a COSE_Sign1 message: signature not a bstr");
    }
    console.log({phdrMap})
    console.log({unprotectedHeader})

    const almost = {
        protectedHeader: prettyHeader(phdrMap),
        unprotectedHeader: prettyHeader(unprotectedHeader),
        payload: new TextDecoder().decode(payload)  ,
        signature: jose.base64url.encode(signature) 
    }

    if (almost.protectedHeader.ctyp && almost.protectedHeader.ctyp.startsWith('application/credential+json')){
        almost.payload = JSON.parse(almost.payload)
    }
  
    return  almost
}


function hexToArrayBuffer(hex) {
    const arr = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
    return typedArrayToBuffer(arr);
}

async function loadFromArrayBuffer(buf) {
    return decodeCOSESign1(buf);
}

const api = { hexToArrayBuffer, loadFromArrayBuffer }

export default api;