const getEmailData = async (id) => {
  let res = await fetch(`https://stucco-store.fly.dev/query`, {
    method: 'POST',
    body: new URLSearchParams({
      'query': `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rsp: <https://reminder-sender.vercel.app/vocabulary#>
      SELECT ?type ?address WHERE {
        <${id}> rsp:parent ?reminder .
        ?reminder rsp:type ?type .
        ?reminder rsp:address ?address .
      }
      `
    })
  })
  let data = await res.json()
  return data.results.bindings[0]
}

const markAsDelivered = async (id) => {
  let res = await fetch(`https://stucco-store.fly.dev/update`, {
    method: 'POST',
    body: new URLSearchParams({
      'update': `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rsp: <https://reminder-sender.vercel.app/vocabulary#>
      insert data {
        <${id}> rsp:delivered "${Date.now()}" .
      }
      `
    })
  })
  return res
}


const sendToQueue = async (id) => {
  // tktk, also dupliucated in CronJobber
  console.log(`add ${id} to queue`)
  let res = await fetch(`https://zeplo.to/https://reminder-sender.vercel.app/email/${id}?_token=<insert_token>`)
}

const sendEmail = async (email) => {
  // tktk lolol
  console.log(`BEEP BOOP SEND EMAIL`)
  return true
}

export const GET = async ({params}) => {
  console.log(`send email: ${params.id}`)
  let email = await getEmailData(params.id)
  let didSucceed = await sendEmail(email)
  if (didSucceed) {
    await markAsDelivered(params.id)
  } else {
    await sendToQueue(params.id)
  }
  return new Response(200)
}