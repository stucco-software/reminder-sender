import { redirect } from '@sveltejs/kit'

export const actions = {
  default: async ({request}) => {
    const data = await request.formData()
    const email = data.get('email')
    redirect(301, `/${email}`)
  }
}