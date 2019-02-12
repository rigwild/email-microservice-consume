'use strict'

const { json, createError, sendError } = require('micro')
const fetch = require('node-fetch')

const endpoint = process.env.email_microservice_endpoint
const token = process.env.email_microservice_token
const to = process.env.email_to
const subject = process.env.email_subject

module.exports = async (req, res) => {
  try {
    if (![endpoint, token, to, subject].every(x => x))
      throw createError(500, 'Missing env variables.')

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

    const result = await fetch(endpoint, {
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

    console.log(JSON.stringify(result))

    res.end(JSON.stringify(result))
  } catch (err) {
    console.error(err)
    sendError(req, res, err)
  }
}
