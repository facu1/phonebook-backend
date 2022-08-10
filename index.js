const express = require('express')
const app = express()

app.use(express.json())

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

app.get('/api/persons', (request, response) => {
  response.json(persons)
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
  const id = Number(request.params.id)
  
  persons = persons.filter((person) => person.id !== id)

  response.status(204).end()
})

const generateId = () => Math.floor(Math.random() * 10000)

app.post('/api/persons', (request, response) => {
  const { body: person } = request
  
  if (!person.name || !person.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const newPerson = {
    id: generateId(),
    name: person.name,
    number: person.number
  }

  persons = [...persons, newPerson]

  response.json(newPerson)
})

app.get('/info', (request, response) => {
  const { length: amountOfPeople } = persons
  const actualTime = new Date()
  const responseMsg = `<p>Phonebook has info for ${amountOfPeople} people</p><p>${actualTime}</p>`
  response.send(responseMsg)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})