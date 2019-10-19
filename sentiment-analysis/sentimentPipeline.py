import flair
import pyrebase
from datetime import datetime
import cmocean
import matplotlib
import time

flair_sentiment = flair.models.TextClassifier.load("en-sentiment")
config = {
    "apiKey": "AIzaSyB0Xp9_mN3Zs1-0Lgq5cmbh91JSRP6P7z8",
    "authDomain": "thew-922e4.firebaseapp.com",
    "databaseURL": "https://thew-922e4.firebaseio.com",
    "storageBucket": "thew-922e4.appspot.com",
}
firebase = pyrebase.initialize_app(config)
db = firebase.database()

#################################################################################
def pull_todays_comments(config, db):

    # Temporarily replace quote function
    def noquote(s):
        return s

    pyrebase.pyrebase.quote = noquote

    dateTimeObj = datetime.now()
    timestampStr = dateTimeObj.strftime("%a %b %d %Y")

    comments = (
        db.child("comments").order_by_child("noteDate").equal_to(timestampStr).get()
    )
    # Insert more complex queries here.

    comment_list = []
    for comment in comments.each():
        a = comment.val()["comment"]
        a = a.replace("\n", " ")
        comment_list.append(a)

    return comment_list


def average_list_sentiment(comments, sentiment_model):
    total = 0
    for i in range(len(comments)):
        s = flair.data.Sentence(comments[i])
        sentiment_model.predict(s)
        total_sentiment = str(s.labels[0])
        sentiment, confidence = total_sentiment.split()
        confidence = confidence.replace("(", "").replace(")", "")
        if sentiment == "NEGATIVE":
            value = -1 * float(confidence)
        else:
            value = float(confidence)
        total = value + total
    average_sentiment = total / (len(comments) + 1)
    return average_sentiment


def sentiment_to_colour(number):
    value = (number + 1) / 2
    cmap = cmocean.cm.thermal
    colour = cmap(value)
    rgb = colour[:3]  # will return rgba, we take only first 3 so we get rgb
    return matplotlib.colors.rgb2hex(rgb)


########################################################################

while True:
    comment_list = pull_todays_comments(config, db)
    average_sentiment = average_list_sentiment(comment_list, flair_sentiment)
    colour = sentiment_to_colour(average_sentiment)
    print(colour)
    db.child("thecolour").set(colour)
    time.sleep(5)
