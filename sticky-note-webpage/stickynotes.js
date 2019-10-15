// Initialize your Firebase app
firebase.initializeApp(config);

var recommendations = firebase.database().ref("comments");

// Define a function to determine if the note colour ir light or dark. This will then be used
// decide on the text colour that should be used.

function lightOrDark(color) {
  // Variables for red, green, blue values
  var r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&"));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return "black";
  } else {
    return "white";
  }
}

var items = [];

// Get the single most recent recommendation from the database and
// update the table with its values. This is called every time the child_added
// event is triggered on the recommendations Firebase reference, which means
// that this will update EVEN IF you don't refresh the page. Magic.
recommendations.limitToLast(18).on("child_added", function(childSnapshot) {
  // Get the recommendation data from the most recent snapshot of data
  // added to the recommendations list in Firebase
  items.push(childSnapshot.val());

  // const list = $("#list");
  // list.empty();

  const list = document.getElementById("list");
  list.innerHTML = "";

  items.reverse().forEach(item => {
    const textColour = lightOrDark(item.noteColour);
    const li = `
      <li>
        <a href="#" style="background: ${item.noteColour}">
          <p style="color:${textColour}">${item.comment}</p>
        </a>
      </li>`;

    // list.append(li);

    list.innerHTML += li;
  });
});
