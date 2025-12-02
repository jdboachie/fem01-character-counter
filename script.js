let pubsub = {
  events: {},

  publish(event, data) {
    if (!this.events[event]) return;
    for (const handler of this.events[event]) {
      handler(data);
    }
  },

  subscribe(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  },
};

let view = {
  characterLimitToggle: document.getElementById("character-limit-toggle"),
  characterCountDisplay: document.getElementById("character-count-display"),
  readTimeDisplay: document.getElementById("read-time-display"),
  sentenceCountDisplay: document.getElementById("sentence-count-display"),
  textarea: document.getElementById("textarea"),
  textareaErrorLabel: document.getElementById("textarea-error-label"),
  whitespaceToggle: document.getElementById("whitespace-toggle"),
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

  showError(isOverLimit) {
    if (isOverLimit == true) {
      if (!this.textarea.classList.contains("error")) {
        this.textarea.classList.add("error");
      }
      this.textareaErrorLabel.textContent =
        "Limit reached! Your text exceeds 300 characters.";
    } else {
      this.textarea.classList.remove("error");
      this.textareaErrorLabel.textContent = "";
    }
  },
};

let counterModel = {
  CHARACTER_LIMIT: 300,
  WPM: 200,
  characterCount: 0,
  readTime: 0,
  sentenceCount: 0,
  wordCount: 0,

  shouldIncludeWhitespace: true,
  shouldUseCharacterLimit: false,

  setIncludeWhitespace(shouldIncludeWhitespace) {
    this.shouldIncludeWhitespace = shouldIncludeWhitespace;
  },

  setUseCharacterLimit(shouldUseCharacterLimit) {
    this.shouldUseCharacterLimit = shouldUseCharacterLimit;
  },

  updateCharacterCount(text) {
    if (this.shouldIncludeWhitespace) {
      this.characterCount = text.length.toString();
    } else {
      this.characterCount = text.replace(/\s/g, "").length.toString();
    }
  },

  updateStats(text) {
    if (text.length > this.CHARACTER_LIMIT && this.shouldUseCharacterLimit) {
      pubsub.publish("LimitErrorChangeEvent", { isOverLimit: true });
      return;
    }

    pubsub.publish("LimitErrorChangeEvent", { isOverLimit: false });

    this.updateCharacterCount(text);
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
  counterModel.updateStats(event.target.value);
}

function onToggleCharacterLimit(event) {
  counterModel.setUseCharacterLimit(event.target.checked);
  counterModel.updateStats(view.textarea.value);
}

function onToggleWhitespace(event) {
  counterModel.setIncludeWhitespace(!event.target.checked);
  counterModel.updateStats(view.textarea.value);
}

function run() {
  view.textarea.addEventListener("input", onInput);
  view.characterLimitToggle.addEventListener("change", onToggleCharacterLimit);
  view.whitespaceToggle.addEventListener("change", onToggleWhitespace);

  // TODO: implement letter density

  pubsub.subscribe("ChangeEvent", (data) => {
    view.update(data);
  });

  pubsub.subscribe("LimitErrorChangeEvent", (data) => {
    view.showError(data.isOverLimit);
  });
}

run();
