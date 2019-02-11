'use strict'

require('dotenv-safe').config()

const { json, createError } = require('micro')
const fetch = require('node-fetch')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  // Check POST method
  if (req.method !== 'POST') throw createError(400, 'Invalid HTTP request method.')

  // Get JSON body
  const body = await json(req).catch(() => {
    throw createError(400, 'Invalid JSON was sent.')
  })

  // Get body parameters and check if set
  const { name, email, message } = body
  if (![name, email, message].every(x => x)) throw createError(400, 'Missing body parameters.')

  const endpoint = process.env.emailMicroserviceEndpoint
  const token = process.env.emailMicroserviceToken
  const to = process.env.emailTo
  const subject = process.env.emailSubject

  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token,
      from: {
        name,
        address: email
      },
      to,
      subject,
      content: message
    })
  }).then(res => res.json())
}
