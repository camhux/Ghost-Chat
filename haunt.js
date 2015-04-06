/* Module to run message selection for ghost responses,
 * and eventually to manage one-time generation of
 * ghost personalities for each socket connection. */
var util = require('util');

var greetings = ["Hi %s, pleased to be chattin",
                  "%s. What's up?",
                  "%s.... That was the name of an old friend. Hello :)",
                  "Uhh, Hello?",
                  "...",
                  "Hi"
                  ];

var responses = ["It's very cold here, lol",
                  "That's interesting.",
                  "What if I decided to torment you",
                  "I was a pretty girl in a life. I was a sexy woman, but now I'm a skeleton. I'm a ghost",
                  "The world's really old",
                  "I died in a fire",
                  "lol",
                  "Ridiculous",
                  "Ghosts don't have genders. Did you know",
                  "Forget everything you know about the afterlife",
                  "Hahah. GHOST",
                  "I had a baby. She is probably out of college by now",
                  "I am actually here.",
                  "Time means nothing when you have died already",
                  "I still use AOL",
                  "What if I decided to find your email address and publicize it"
                  ];

var lastResponse;

function getRandomElement(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

exports.greet = function(name) {
  var result, greeting = getRandomElement(greetings);
  (greeting.indexOf('%') >= 0) ? result = util.format(greeting, name) : result = greeting;
  return result;
}

exports.respond = function(prev) {
  return getRandomElement(responses);
}
