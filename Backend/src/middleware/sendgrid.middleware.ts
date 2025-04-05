import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (recipients: string | string[], subject: string, html: string, from: string = process.env.SENDGRID_FROM_EMAIL) => {
    const msg = {
        to: recipients, 
        from: from, 
        subject: subject,
        html: html,
    };

    try {
        const response = await sgMail.send(msg);
        return response;
    } catch (error) {
        console.error('Sendgrid Error:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
};

export default sendEmail;