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

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  
  const person = persons.find((person) => person.id === id)

  if (person) {
    return response.json(person)
  }

  response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => {
      console.log(error);
      response.status(400).send({ error: 'malformatted id' })
    })
})

const generateId = () => Math.floor(Math.random() * 10000)

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body
  
  if (!name || !number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

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
    })
})

app.get('/info', (request, response) => {
  const { length: amountOfPeople } = persons
  const actualTime = new Date()
  const responseMsg = `<p>Phonebook has info for ${amountOfPeople} people</p><p>${actualTime}</p>`
  response.send(responseMsg)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})