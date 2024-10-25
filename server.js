const express = require('express')
const app = express()
const adminRoutes = require('./routers/admin')
const userRoutes = require('./routers/user')
const connectDB = require('./db/connectDB')
const path = require('path')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const nocache = require('nocache')


app.use(nocache())
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: 'mongodb://localhost:27017/session_db',
        collection: 'sessions'
    })
}));


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.use('/', userRoutes)
app.use('/admin', adminRoutes)

connectDB()


app.listen(3000, () => {
    console.log('server runnig port 3000');
})