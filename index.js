require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())

morgan.token('data-sent', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data-sent', {
  skip: (req) => req.method !== 'POST'
}))

app.use(morgan('tiny', { skip: (req) => req.method === 'POST' }))

app.use(cors())

app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then((people) => {
      response.json(people)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  const person = { name, number }

  Person
    .findByIdAndUpdate(
      request.params.id,
      person,
      { new: true, runValidators: true, context: 'query' }
    )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  const person = new Person({
    name,
    number
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response, next) => {
  Person
    .find({})
    .then((people) => {
      const { length: amountOfPeople } = people
      const actualTime = new Date()
      const responseMsg = `<p>Phonebook has info for ${amountOfPeople} people</p><p>${actualTime}</p>`
      response.send(responseMsg)
    })
    .catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'Malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({
      error: error.message
    })
  } else if (error.name === 'MongoServerError') {
    return response.status(400).send({
      error: 'Name must be unique'
    })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})