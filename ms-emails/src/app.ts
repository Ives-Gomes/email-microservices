import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());
const port = 3334;

app.get('/', (req, res) => {
	const transport = nodemailer.createTransport({
		host: "smtp.mailtrap.io",
		port: 2525,
		auth: {
			user: "0d65f13fede99c",
			pass: "750e45bf5e202a"
		}
	});

	const mailOptions = {
		from: 'no-reply@ms-emails.com',
		to: 'sender@email.com',
		subject: 'E-mail enviado usando Node!',
		html: '<p>Bem fácil, não? ;)</p>'
	};

	transport.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
			return res.status(400).send({ message: 'Falha no envio do email' })
		} else {
			console.log('Email enviado: ' + info.response);
		}
	});

	return res.status(200).send({ message: 'E-mail enviado com sucesso!' })
});

app.listen(port);
