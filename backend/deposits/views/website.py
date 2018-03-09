from deposits import app
from flask import render_template


@app.route('/')
def home():
    return 'This is time manager API'
