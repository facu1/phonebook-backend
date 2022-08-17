require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())

morgan.token('data-sent', (req, res) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data-sent', {
  skip: (req, res) => req.method !== 'POST'
}))

app.use(morgan('tiny', { skip: (req, res) => req.method === 'POST' }))

app.use(cors())

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

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
    .then((result) => {
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

const generateId = () => Math.floor(Math.random() * 10000)

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  Person
    .find({})
    .then((people) => {
      if (people.some(({name: personName}) => personName === name)) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }

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
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({
      error: error.message
    })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})