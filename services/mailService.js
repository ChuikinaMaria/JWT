import nodemailer from 'nodemailer';

class MailService {

	constructor() {
		
		this.transporter = nodemailer.createTransport({
			host: 'smtp.yandex.com',
			port: process.env.SMTP_PORT,
			secure: true,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			},
			tls: {
				rejectUnauthorized: false,
			}
		});
	}

	async sendActivationMail(to, link) {
		try {

			await this.transporter.sendMail({
				from: process.env.SMTP_USER,
				to,
				subject: 'Activate your account at ' + process.env.API_URL,
				text: '',
				html: 
				`
				<div>
				<h1>To activate your account follow the link</h1>
				<a href="${link}">${link}</a>
				</div>				
				`
			})
		} catch(e) {
			console.log(e)
		}
	};

}

export const mailService = new MailService();