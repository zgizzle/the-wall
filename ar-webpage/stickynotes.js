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
/*var xcount = 0;
var ycount = 0;
var count = 1; */

var innercount = 0;
var roundcount = 0;
var xpos = 0;
var ypos = 0;

// Get the single most recent recommendation from the database and
// update the table with its values. This is called every time the child_added
// event is triggered on the recommendations Firebase reference, which means
// that this will update EVEN IF you don't refresh the page. Magic.
recommendations.limitToLast(7).on("child_added", function(childSnapshot) {
  // Get the recommendation data from the most recent snapshot of data
  // added to the recommendations list in Firebase
  items.push(childSnapshot.val());
  //const list = $("#list");
  //list.empty();
  const list = document.getElementById("marker");
  list.innerHTML = "";

  /*xcount = 0;
  ycount = 0;
  count = 0;*/
  innercount = 0;
  roundcount = 1;
  xpos = 0;
  ypos = 0;

  items.reverse().forEach(item => {
    const textColour = lightOrDark(item.noteColour);
    console.log(roundcount, innercount, xpos, ypos);
    const li = `
    <a-entity
    id="note"
    geometry="primitive: box; width: .9; height: 0.01; depth: .9"
    draw="background: ${item.noteColour}" 
    textwrap="textAlign: center; x: 128; y: 128; text: ${item.comment}; color:${textColour}"
    position="${xpos} 0.02 ${ypos}"
        ></a-entity>
  `;
    // list.append(li);

    /* xcount += 1.3;
    count += 1; 

    if (count % 3 == 0) {
      xcount = 0;
      ycount += 1.3;
    }*/
    if (roundcount == 1) {
      xpos += 1;
      roundcount += 1;
    } else {
      if (innercount == 0) {
        if (xpos < ypos) {
          xpos += 1;
        } else if (ypos < xpos) {
          ypos += 1;
        } else if (xpos == ypos) {
          if (roundcount % 2 == 0) {
            xpos -= 1;
          } else {
            ypos -= 1;
          }
          innercount += 1;
        }
      } else {
        if (xpos !== 0 && ypos !== 0) {
          if (roundcount % 2 == 0) {
            xpos -= 1;
          } else {
            ypos -= 1;
          }
        } else {
          if (roundcount % 2 == 0) {
            ypos += 1;
          } else {
            xpos += 1;
          }
          innercount = 0;
          roundcount += 1;
        }
      }
    }

    list.innerHTML += li;
    console.log(items);
  });
});
