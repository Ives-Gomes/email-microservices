import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { Kafka } from 'kafkajs';

const app = express();
app.use(cors());
app.use(express.json());
const port = 3334;

app.get('/', async (req, res) => {
	const kafka = new Kafka({
		clientId: 'ms-emails',
		brokers: ['localhost:9092'],
	})

	const admin = kafka.admin()
	const consumer = kafka.consumer({ groupId: '1' }) // verify group

	await admin.connect()
	await consumer.connect()

	await consumer.subscribe({ topic: 'kafka-topic', fromBeginning: true })

	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			console.log({
				value: message.value?.toString(),
			})
		},
	})

	await admin.disconnect()

	return res.send()

	// const transport = nodemailer.createTransport({
	// 	host: "smtp.mailtrap.io",
	// 	port: 2525,
	// 	auth: {
	// 		user: "0d65f13fede99c",
	// 		pass: "750e45bf5e202a"
	// 	}
	// });

	// const mailOptions = {
	// 	from: 'no-reply@ms-emails.com',
	// 	to: 'sender@email.com',
	// 	subject: 'E-mail enviado usando Node!',
	// 	html: '<p>Bem fácil, não? ;)</p>'
	// };

	// transport.sendMail(mailOptions, function (error, info) {
	// 	if (error) {
	// 		console.log(error);
	// 		return res.status(400).send({ message: 'Falha no envio do email' })
	// 	} else {
	// 		console.log('Email enviado: ' + info.response);
	// 	}
	// });

	return res.status(200).send({ message: 'E-mail enviado com sucesso!' })
});

app.listen(port);
