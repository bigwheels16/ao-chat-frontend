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

export function escapeHtml(html) {
  return html.replace(/"/g, '&quot;')
}