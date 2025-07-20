from django.core.mail import send_mail

def send_order_email(subject, message, to_email):
    send_mail(
        subject,
        message,
        'your_email@gmail.com',
        [to_email],
        fail_silently=False,
    )
