import nodemailer from 'nodemailer'
import mjml2html from 'mjml'

// Configurer le transporteur Nodemailer
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.MAILER_USER || '', // Utilisez votre propre adresse email
		pass: process.env.MAILER_PASSWORD // Utilise un mot de passe d'application pour plus de sécurité
	}
})

// Fonction pour générer le contenu HTML à partir du template MJML
const generateVerificationEmail = (verificationLink) => {
	const mjmlTemplate = `
      <mjml>
        <mj-body background-color="#f9f9f9">
          <!-- Header Section -->
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="28px" color="#333333" align="center" font-family="Arial, sans-serif" font-weight="bold" line-height="1.5">
                <span style="color: #4CAF50;">Le Juste Prix</span>
              </mj-text>
              <mj-text font-size="22px" color="#333333" align="center" font-family="Arial, sans-serif" line-height="1.5">
                Vérifiez votre adresse email
              </mj-text>
            </mj-column>
          </mj-section>

          <!-- Information Section -->
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="16px" color="#555555" align="center" font-family="Arial, sans-serif" line-height="1.5" padding-bottom="20px">
                Merci de vous être inscrit sur <strong>Le Juste Prix</strong> ! Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous.
              </mj-text>
              <mj-button
                background-color="#4CAF50"
                color="#ffffff"
                href="${verificationLink}"
                align="center"
                font-family="Arial, sans-serif"
                padding="15px 25px"
                border-radius="5px"
                font-size="16px"
                text-transform="uppercase"
              >
                Vérifier mon compte
              </mj-button>
            </mj-column>
          </mj-section>

          <!-- Disclaimer Section -->
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="14px" color="#777777" align="center" font-family="Arial, sans-serif" line-height="1.5" padding-top="15px">
                Si vous n'avez pas demandé cette vérification, ignorez cet e-mail.
              </mj-text>
            </mj-column>
          </mj-section>

          <!-- Footer Section -->
          <mj-section background-color="#f4f4f4">
            <mj-column>
              <mj-text font-size="12px" color="#999999" align="center" font-family="Arial, sans-serif" padding="20px 0">
                &copy; ${new Date().getFullYear()} Le Juste Prix. Tous droits réservés.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
  `

	// Convertir le MJML en HTML
	const { html } = mjml2html(mjmlTemplate)

	return html
}

// Fonction pour envoyer l'email de vérification
export const sendVerificationEmail = async (to, verificationLink) => {
	// Générer le HTML à partir du template MJML
	const htmlContent = generateVerificationEmail(verificationLink)

	const mailOptions = {
		from: process.env.MAILER_USER,
		to,
		subject: 'Vérifiez votre compte',
		html: htmlContent // Utiliser le HTML généré par MJML
	}

	// Envoyer l'email via Nodemailer
	return transporter.sendMail(mailOptions)
}
