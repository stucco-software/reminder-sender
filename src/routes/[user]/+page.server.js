import rdfkv from 'rdf-kv.js'

const getReminders = async (user) => {
  let res = await fetch(`https://stucco-store.fly.dev/query`, {
    method: 'POST',
    body: new URLSearchParams({
      'query': `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rsp: <https://reminder-sender.vercel.app/vocabulary#>
      SELECT ?id ?cadence ?type
      WHERE {
        ?id rsp:address "${user}" .
        ?id rdf:type <rsp:Reminder> .
        ?id rsp:cadence ?cadence .
        ?id rsp:type ?type .
      }
      `
    })
  })
  let data = await res.json()
  return data.results.bindings
}

const createReminder = async (formData) => {
  const id = `uuid:${crypto.randomUUID()}`
  const patch = rdfkv(id, formData)
  console.log(patch)
  let res = await fetch(`https://stucco-store.fly.dev/update`, {
    method: 'POST',
    body: new URLSearchParams({
      'update': `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rsp: <https://reminder-sender.vercel.app/vocabulary#>
      insert data {
        ${patch.insert}
      }
      `
    })
  })

  console.log(res)
}

export const load = async ({params}) => {
  const reminders = await getReminders(params.user)
  return {
    address: params.user,
    reminders
  }
}

export const actions = {
  default: async ({request}) => {
    const data = await request.formData()
    await createReminder(data)
  }
}