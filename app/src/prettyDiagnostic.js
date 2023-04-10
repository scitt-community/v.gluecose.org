export const prettyDiagnostic = async (coseData) => {
  const diagnostic = await window.cbor.diagnose(coseData)
  return diagnostic
}
