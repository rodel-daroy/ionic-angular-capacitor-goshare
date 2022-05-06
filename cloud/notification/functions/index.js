const functions = require('firebase-functions')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const admin = require('firebase-admin')

const serviceAccount = require('./goshare360-firebase-adminsdk-abs48-5f5df3b042.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://goshare360.firebaseio.com'
})


app.post('/pushNotification', function (req, res, next) {

    let params = req.body

    const payload = {
        notification: {
            title: params.title,
            body: params.body
        }
    }

    const options = {
        priority: 'high',
        timeToLive: 60 * 60 * 24
    }

    admin.messaging().sendToDevice(params.fcmToken, payload, options).then(resp => {

        if (resp.successCount === 1 && resp.failureCount === 0) {
            res.json({success: 1, msg: 'Notification sent successfully'})
        } else {
            res.json({success: 0, msg: 'Notification not sent'})
        }

    }).catch(err => console.log(JSON.stringify(err)))

    admin.messaging().send({
        webpush: {
            notification: {
                title: params.title,
                body: params.body
            },
        }
    })
})

app.post('/sendRequest', function (req, res, next) {

    let params = req.body

    const headers = {
        'Authorization': '',
        'Content-Type': 'application/json'
    }

    const data = {
        notification: {
            title: params.title,
            body: params.body
        },
        to: params.fcmToken
    }

    axios.post('https://fcm.googleapis.com/fcm/send', data, {headers: headers}).then(resp => {

        if (resp.data.success && resp.data.success === 1) {
            res.json({success: 1, msg: 'Notification sent successfully'})
        } else {
            res.json({success: 0, msg: 'Notification not sent'})
        }
    }).catch(err => console.log(JSON.stringify(err)))
})


app.listen(port, () => console.log('Notification function listening on port: ' + port))

exports.notification = functions.https.onRequest(app)
