import sendgrid
import os
from sendgrid.helpers.mail import *

sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))

def send_verify_mail(to, username, token):
    from_email = Email("deposits@aviaryan.com")
    to_email = Email(to)
    subject = "[DEPOSITS] Verify your account"
    content = Content(
        "text/plain",
        "Hi " + username + ",\n\n" \
        + "Verify this email by going to the following link\n\n" \
        + "http://localhost:3000/verify?token=" + token
    )
    mail = Mail(from_email, subject, to_email, content)
    response = sg.client.mail.send.post(request_body=mail.get())
    print(response.status_code)


def send_welcome_mail(to, username):
    from_email = Email("deposits@aviaryan.com")
    to_email = Email(to)
    subject = "[DEPOSITS] Welcome to Deposits"
    content = Content(
        "text/plain",
        "Hi " + username + ",\n\n" \
        + "We are so glad to have you on Deposits. Visit the following link to login.\n\n" \
        + "http://localhost:3000/"
    )
    mail = Mail(from_email, subject, to_email, content)
    response = sg.client.mail.send.post(request_body=mail.get())
    print(response.status_code)
