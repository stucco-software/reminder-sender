import { asyncMap } from "$lib/utils.js"

const cadence2ms = (cadence) => {
  // This Cadence is Fake AF
  switch(true) {
    case cadence === 'rsp:Quarterly':
      return 30000;
    case cadence === 'rsp:Monthly':
      return 10000;
    default:
      return 0;
  }
}

const getAllReminders = async () => {
  let res = await fetch(`https://stucco-store.fly.dev/query`, {
    method: 'POST',
    body: new URLSearchParams({
      'query': `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rsp: <https://reminder-sender.vercel.app/vocabulary#>
      SELECT ?id ?cadence ?type
      WHERE {
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

const checkDue = async (reminder) => {
  let now = Date.now()
  let res = await fetch(`https://stucco-store.fly.dev/query`, {
    method: 'POST',
    body: new URLSearchParams({
      'query': `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rsp: <https://reminder-sender.vercel.app/vocabulary#>
      ask {
        ?id rdf:type <rsp:Reminder> .
        ?email rsp:parent ?id .
        ?email rsp:delivered ?delivery .
        FILTER (?delivery < ${now - cadence2ms(reminder.cadence.value)})
      }
      `
    })
  })
  let data = await res.json()
  console.log(`Is reminder ${reminder.id.value} due to a new email on the ${reminder.cadence.value} cadence?`)
  if (!data.boolean) {
    console.log(`yes`)
    return reminder
  } else {
    console.log(`no`)
    return data.boolean
  }
}

const isDueForQueue = async (reminders) => {
  const checks = await asyncMap(reminders, checkDue)
  return checks.filter(reminder => reminder)
}

const createEmail = async (reminder) => {
  const id = `uuid:${crypto.randomUUID()}`
  let res = await fetch(`https://stucco-store.fly.dev/update`, {
    method: 'POST',
    body: new URLSearchParams({
      'update': `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rsp: <https://reminder-sender.vercel.app/vocabulary#>
      insert data {
        <${id}> rdf:type <rsp:Email> .
        <${id}> rsp:parent <${reminder.id.value}> .
        <${id}> rsp:delivered "false" .
      }
      `
    })
  })
  return id
}

const send2queue = async (id) => {
  // TKTK
  console.log(`add ${id} to queue`)
  let res = await fetch(`https://zeplo.to/https://reminder-sender.vercel.app/email/${id}?_token=<insert_token>`)
  return res
}

export const GET = async (event) => {
  const reminders = await getAllReminders()
  const dueForQueue = await isDueForQueue(reminders)
  const emails = await asyncMap(dueForQueue, createEmail)
  const results = await asyncMap(emails, send2queue)
  console.log(results)
  return new Response(200)
}