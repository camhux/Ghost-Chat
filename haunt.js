/* Module to run message selection for ghost responses,
 * and eventually to manage one-time generation of
 * ghost personalities for each socket connection. */
var util = require('util');

var greetings = ["Hi %s, pleased to be chattin",
                  "%s. What's up?",
                  "%s.... That was the name of an old friend. Hello :)",
                  "Uhh, Hello?",
                  "...",
                  "Hi",
                  "Greetings.",
                  "Hellol",
                  "%s is a mook's name. Anyway, hi",
                  "Thank u for letting me into your browser haha",
                  "Awoken once more..... lol",
                  "[tired, resigned voice] Boo",
                  "Hi %s",
                  "Bonjour",
                  "Hola",
                  "Well met, mortal.",
                  "Who do you think you are, awakening me from my slumber haha",
                  "Salutations, befleshed one",
                  "*rattles bones* Lol. Hi %s",
                  "Do you hear it, %s? My distant wailing?",
                  "A new victim...jk :)",
                  "%s is a nice name. Are you a nice person? It matters later.",
                  "hi"
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
                  "What if I decided to find your email address and publicize it",
                  "What do you mean by that?",
                  "I don't think that's true.",
                  ["Have you ever seen Blade Runner (final cut)?", "They have a VHS of it where I am"],
                  "Haha. Whatever :)",
                  "I don't think so",
                  "I agree",
                  "Yeah man.",
                  "What's that?",
                  "I forget what those words mean. It's been a long time since I was a human being like you",
                  "What I wouldn't do for just to eat a sandwich again, lol",
                  "Appreciate what you have. It doesn't last forever",
                  "Have you ever been in love?",
                  "Yeah",
                  "Is this freaky to you? It's pretty weird for me.",
                  "Jealous of the new MacBook. We're like 15 years behind here",
                  ["LSKdfhosdhseght39jsldfs", "woops sorry"],
                  "Wait'll yousee what happens when you die lol.,",
                  "Can you give me your home address? I'm just curious",
                  "I'm trying to send you my Amazon wishlist link but it won't let me. Wack",
                  "The human body is just full of goo. And it's all trying to get out. You just wait",
                  "Please drive carefully. That's all I ask now",
                  "Enjoy the warmth of existence while you can, dude",
                  ["When I got home from my job at the embassy in Djibouti, I got this dog named " +
                    "Bluto.", "I was all shook up from the bombing and he helped me sleep through " + 
                    "the nights when I would wake up rattling from explosions in my dreams. ",
                    "Anyway, he got cancer, and he's here with me now. Death's not the end. "]
                  ];



// Helper function
function getRandomElement(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

function Ghost() {
  this.lastResponse = '';
}

Ghost.prototype =  {

  considerGreeting: function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      setTimeout(function() {resolve()}, self._firstPause());
    });

  },

  greet: function(name) {
    var self = this;
    var greeting = getRandomElement(greetings);

    greeting = (greeting.indexOf('%') >= 0)
      ? util.format(greeting, name)
      : greeting;

    console.log('Greeting selected: ' + greeting);

    return new Promise(function(resolve, reject) {
      setTimeout(function() {resolve(greeting)}, self._firstTyping());
    });

  },

  considerResponse: function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      setTimeout(function() {resolve()}, self._responsePause());
    });

  },

  respond: function() {
    var self = this;
    var lastResponse = self.lastResponse;
    var response;

    while (response === undefined || response === lastResponse) {
      response = getRandomElement(responses);
    }

    self.lastResponse = response;

    return self._ResponseChainer(response);
  },

  _firstPause: function() {
    return Math.random()*2000 + 1000;
  },

  _firstTyping: function() {
    return Math.random()*3000 + 1000;
  },

  _responsePause: function() {
    return Math.random()*2000 + 1000;
  },

  _responseTyping: function() {
    return Math.random()*2000 + 1000;
  },

  _ResponseChainer: function(responseArr) {
    var self = this;
    var i = 0;

    if (!Array.isArray(responseArr)) responseArr = [responseArr];
    
    var len = responseArr.length;
    var chainer = {

      next: function next() {
        if (i < len) {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
                        resolve(responseArr[i++]);
                      }, self._responseTyping());
          });
        } else return undefined;
      }
    }
    return chainer;
  }

}

module.exports = Ghost;