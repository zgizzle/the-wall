// TODO: Replace with your project's config object. You can find this
// by navigating to your project's console overview page
// (https://console.firebase.google.com/project/your-project-id/overview)
// and clicking "Add Firebase to your web app"
var addDays = function(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toDateString();
};

// Initialize your Firebase app
firebase.initializeApp(config);

// Reference to the recommendations object in your Firebase database
var recommendations = firebase.database().ref("comments");

// Save a new recommendation to the database, using the input in the form
var submitRecommendation = function() {
  // Get input values from each of the form elements
  var message = $("#message").val();
  var noteColour = $("#noteColour").val();
  var noteDays = $("#noteDays").val();
  var noteDate = new Date().toDateString();
  var noteexpiry = addDays(noteDate, noteDays);
  var expiryorder = Date.parse(noteexpiry);
  console.log(noteexpiry);
  // Push a new recommendation to the database using those values
  recommendations.push({
    comment: message,
    noteColour: noteColour,
    noteDate: noteDate,
    expiryOrder: expiryorder
  });
};

// When the window is fully loaded, call this function.
// Note: because we are attaching an event listener to a particular HTML element
// in this function, we can't do that until the HTML element in question has
// been loaded. Otherwise, we're attaching our listener to nothing, and no code
// will run when the submit button is clicked.
$(window).on("load", function() {
  // Find the HTML element with the id recommendationForm, and when the submit
  // event is triggered on that element, call submitRecommendation.
  $("#form").submit(submitRecommendation);
});
