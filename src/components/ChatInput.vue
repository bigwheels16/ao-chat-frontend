<template>
  <div class="chat-input-container">
    <v-textarea
      id="command-input"
      name="commandInput"
      :label="contextDisplay"
      filled
      v-model="inputValue"
      @keydown.prevent.enter.exact="processInput"
      @keyup.up="historyUp"
      @keyup.down="historyDown"
      @input="onInputChange"
      auto-grow
      rows="3"
      class="chat-input-field"
    ></v-textarea>
    <v-btn v-on:click="processInput" class="send-btn">Send</v-btn>
  </div>
</template>

<script>
import { eventBus } from '@/lib/core/event_bus'
import { split } from '@/lib/util'
import chat_commands from '@/lib/chat_commands'

export default {
  name: "ChatInput",
  data: function() {
    return {
      inputValue: "",
      history: [],
      historyPosition: 0,
      commands: [],
      context: "",
      usingContext: true
    }
  },

  methods: {
    historyUp() {
      if (this.historyPosition > 0) {
        this.historyPosition -= 1
        this.inputValue = this.history[this.historyPosition]
      }
    },
    historyDown() {
      if (this.historyPosition < this.history.length) {
        this.historyPosition += 1
        this.inputValue = this.history[this.historyPosition]
      } else if (this.historyPosition == this.history.length) {
        this.inputValue = ""
      }
    },
    processInput: function() {
      // TODO handle ctrl+enter: https://forum.vuejs.org/t/how-to-prevent-enter-event-when-ctrl-enter-is-triggered/79518/2
      if (!this.inputValue) {
        return
      }

      this.handleInput(this.inputValue)
      
      this.history.push(this.inputValue)
      this.historyPosition = this.history.length
      this.inputValue = ""
      this.usingContext = true
    },
    handleInput: function(inputText) {
      if (!inputText.startsWith("/") && this.context) {
        inputText = this.context + " " + inputText
      }

      if (inputText.startsWith("/")) {
        const [trigger, args] = split(inputText.substring(1), " ", 2)

        const chat_command = this.commands.find(element => element.triggers.includes(trigger))
        if (chat_command) {
          chat_command.handler(args, this)
        } else {
          eventBus.$emit("chatMessage", `Unknown command '${trigger}'.`)
        }
      } else {
        eventBus.$emit("chatMessage", `No channel selected.`)
      }
    },
    onInputChange: function(inputText) {
      if (inputText.startsWith("/")) {
        this.usingContext = false
      } else {
        this.usingContext = true
      }
    }
  },

  computed: {
    // a computed getter
    contextDisplay: function () {
      if (this.usingContext) {
        return this.context
      } else {
        return ""
      }
    }
  },

  mounted: function() {
    const self = this

    eventBus.$on("chatCommand", function(message) {
      self.handleInput(message)
    })

    eventBus.$on("newContext", function(context) {
      self.context = context
      self.usingContext = true
      
      // select input box
      self.$el.querySelector("#command-input").focus()
    })

    this.commands = chat_commands
  }
}
</script>

<style scoped>
.chat-input-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 0 12px;
  width: 100%;
}
.chat-input-field {
  flex-grow: 1;
}
.send-btn {
  margin-top: 4px;
}
</style>