// taken from: https://stackoverflow.com/a/1026087/280574
export const capitalizeFirstLetter = ([ first, ...rest ], locale = navigator.language) =>
  first.toLocaleUpperCase(locale) + rest.join('')

// taken from: https://stackoverflow.com/a/34890276/280574
export const groupBy = function(xs, key_func) {
  return xs.reduce(function(rv, x) {
    const key = key_func(x);
    (rv[key] = rv[key] || []).push(x)
    return rv
  }, {})
}

// taken from: https://stackoverflow.com/a/29998400/280574
export function split(s, separator, limit=null) {
  const split = s.split(separator)
  if (limit == null) {
    return split
  }

  if (split.length <= limit) {
      return split
  }
  const out = split.slice(0, limit - 1)
  out.push(split.slice(limit - 1).join(separator))
  return out
}

// taken from: https://stackoverflow.com/a/5002618/280574
export function stripHtml(s) {
  const div = document.createElement("div");
  div.innerHTML = s;
  return div.textContent || div.innerText || "";
}

export function splitByDelimiters(str, delimiters=['"']) {
  let results = []

  let i = 0
  let nextChar = " "
  for (let j = 0; j < delimiters.length; j++) {
    if (str[i] == delimiters[j]) {
      nextChar = delimiters[j]
      i += 1
    }
  }

  let newI = findNext(str, i, nextChar)
  if (newI) {
    results.push(str.substring(i, newI))
    i = newI + 1
    if (nextChar != " ") {
      i += 1
    }

    if (i < str.length) {
      results.push(str.substring(i, str.length))
    }
  } else {
    results.push(str.substring(i))
  }

  return results
}

function findNext(s, start, char) {
  for (let i = start; i < s.length; i++) {
    if (s[i] == char) {
      return i
    }
  }
  return null
}

// Fills printf-style placeholders (%s, %d, %i, %u, %f, %j and %%, with optional width, zero padding
// and precision) in a template; other specifiers stay as written, and leftover arguments are
// appended with spaces
export function format(template, ...args) {
  let next = 0
  let out = String(template).replace(/%(0?)(\d*)(?:\.(\d+))?([sdiufj%])/g, (specifier, zero, width, precision, type) => {
    if (type === "%") {
      return "%"
    }
    if (next >= args.length) {
      return specifier
    }
    const arg = args[next++]
    let text
    if (type === "s") {
      text = String(arg)
    } else if (type === "j") {
      text = JSON.stringify(arg)
    } else if (type === "f") {
      text = Number(arg).toFixed(precision === undefined ? 6 : Number(precision))
    } else {
      text = String(Number(arg))
    }
    return pad(text, Number(width), zero === "0")
  })
  for (; next < args.length; next++) {
    out += " " + args[next]
  }
  return out
}

// Pads a value to a minimum width: numbers with zeros after any minus sign when asked, otherwise spaces
function pad(text, width, zeros) {
  if (text.length >= width) {
    return text
  }
  if (zeros && /^-?\d/.test(text)) {
    const sign = text.startsWith("-") ? "-" : ""
    return sign + text.slice(sign.length).padStart(width - sign.length, "0")
  }
  return text.padStart(width, " ")
}

export function escapeHtml(html) {
  return html.replace(/"/g, '&quot;')
}

// Parses the backend's base URL, which must be ws:// or wss://
function parseBaseUrl(baseUrl) {
  const url = new URL(baseUrl)
  if (url.protocol !== "ws:" && url.protocol !== "wss:") {
    throw new Error("The WebSocket URL must start with ws:// or wss://")
  }
  return url
}

// Backend URL for one chat server: the base URL with the server id appended to its path
export function connectUrl(baseUrl, server) {
  const url = parseBaseUrl(baseUrl)
  url.pathname = url.pathname.replace(/\/+$/, "") + "/" + encodeURIComponent(server)
  return url.toString()
}

// Backend URL that lists the chat servers: the base URL over http:// or https://, without a trailing slash
export function serverListUrl(baseUrl) {
  const url = parseBaseUrl(baseUrl)
  url.protocol = url.protocol === "wss:" ? "https:" : "http:"
  url.pathname = url.pathname.replace(/\/+$/, "")
  return url.toString()
}
