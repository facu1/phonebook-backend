const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://admin:${password}@cluster0.wodas6o.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then(() => {
    if (process.argv.length === 5) {
      const name = process.argv[3]
      const number = process.argv[4]

      const person = new Person({
        name,
        number,
      })

      person
        .save()
        .then(({ name, number }) => {
          console.log(`added ${name} number ${number} to phonebook`)
          mongoose.connection.close()
        })
        .catch((err) => console.log(err))
    } else {
      Person
        .find({})
        .then((people) => {
          console.log('phonebook:')
          for (const { name, number } of people) {
            console.log(`${name} ${number}`)
          }

          mongoose.connection.close()
        })
    }
  })