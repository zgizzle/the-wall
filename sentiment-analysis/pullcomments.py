def pull_todays_comments():
    import pyrebase
    from datetime import datetime

    # Temporarily replace quote function
    def noquote(s):
        return s

    pyrebase.pyrebase.quote = noquote

    dateTimeObj = datetime.now()
    timestampStr = dateTimeObj.strftime("%a %b %d %Y")

    config = {
        "apiKey": "AIzaSyB0Xp9_mN3Zs1-0Lgq5cmbh91JSRP6P7z8",
        "authDomain": "thew-922e4.firebaseapp.com",
        "databaseURL": "https://thew-922e4.firebaseio.com",
        "storageBucket": "thew-922e4.appspot.com",
    }

    firebase = pyrebase.initialize_app(config)

    db = firebase.database()

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

