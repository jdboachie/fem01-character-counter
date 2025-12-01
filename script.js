let pubsub = {
  events: {},

  subscribe(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  },

  publish(event, data) {
    if (!this.events[event]) return;
    for (const handler of this.events[event]) {
      handler(data);
    }
  },
};

let view = {
  characterCountDisplay: document.getElementById("character-count-display"),
  readTimeDisplay: document.getElementById("read-time-display"),
  sentenceCountDisplay: document.getElementById("sentence-count-display"),
  textarea: document.getElementById("textarea"),
  wordCountDisplay: document.getElementById("word-count-display"),

  update(data) {
    this.characterCountDisplay.textContent = data.characterCount;
    this.sentenceCountDisplay.textContent = data.sentenceCount;
    this.wordCountDisplay.textContent = data.wordCount;
    this.readTimeDisplay.textContent =
      data.readTime === 0
        ? "0 minutes"
        : data.readTime < 1
          ? "< 1 minute"
          : `${data.readTime.toFixed(2)} minutes`;
  },
};

let counterModel = {
  WPM: 200,
  characterCount: 0,
  readTime: 0,
  sentenceCount: 0,
  wordCount: 0,

  update(text) {
    this.characterCount = text.length.toString();
    this.wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    this.sentenceCount = text.trim().split(".").filter(Boolean).length;
    // TODO: Add support for sentences that end in "?"
    this.readTime = this.wordCount / this.WPM;

    pubsub.publish("ChangeEvent", {
      characterCount: this.characterCount,
      wordCount: this.wordCount,
      sentenceCount: this.sentenceCount,
      readTime: this.readTime,
    });
  },
};

function onInput(event) {
  counterModel.update(event.target.value);
}

function run() {
  view.textarea.addEventListener("input", onInput);
  // TODO: react to the toggles
  // TODO: implement character counts

  pubsub.subscribe("ChangeEvent", (data) => {
    view.update(data);
  });
}

run();
