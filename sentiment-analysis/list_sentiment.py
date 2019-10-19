def average_list_sentiment(comments):
import flair

flair_sentiment = flair.models.TextClassifier.load("en-sentiment")
total = 0
for i in range(len(comments)):
    s = flair.data.Sentence(comments[i])
    flair_sentiment.predict(s)
    total_sentiment = str(s.labels[0])
    sentiment, confidence = total_sentiment.split()
    confidence = confidence.replace("(", "").replace(")", "")
    if sentiment == "NEGATIVE":
        value = -1 * float(confidence)
    else:
        value = float(confidence)
    total = value + total
average_sentiment = total / (len(sentence) + 1)
return average_sentiment
