const findAfter = require('unist-util-find-after')
const visit = require('unist-util-visit-parents')

const MAX_HEADING_DEPTH = 6

module.exports = plugin

function plugin () {
  return transform
}

function transform (tree) {
  for (let depth = MAX_HEADING_DEPTH; depth > 0; depth--) {
    visit(
      tree,
      node => node.type === 'heading' && node.depth === depth,
      chunkify
    )
  }
}

function toSlug(text) {
  let hasParenthesis = text.indexOf('(')

  if (text.indexOf('(#')>-1) {
    let regExp = /\(#([^)]+)\)/;
    let id = regExp.exec(text)

    if (id!==null) {
      return id[1]
        .trim()
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/\s/g, "_");
    } else {
      return ''
    }

  } else {
    if (hasParenthesis > -1) {
      text = text.substring(0, hasParenthesis)
    }

    return text
    .trim()
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/\s/g, "_");
  }
}

function getAccess(text) {
  if (text.indexOf('(@') > 0) {
    let regExp = /\(@([^)]+)\)/;
    let access = regExp.exec(text)
    return access[1]
    .trim()
    .toLowerCase()
  } else {
    return ''
  }
}

function getClass(text) {
  if (text.indexOf('(.') > 0) {
    let regExp = /\(\.([^)]+)\)/;
    let customClass = regExp.exec(text)
    return ' ' + customClass[1]
    .trim()
    .toLowerCase()
  } else {
    return ''
  }
}

function chunkify (node, ancestors) {
  let header_value = node.children[0].value

  const access = getAccess(header_value)
  let customClass = getClass(header_value)

  const start = node
  const depth = start.depth
  const parent = ancestors[ancestors.length - 1]

  const isEnd = node => node.type === 'heading' && node.depth <= depth || node.type === 'export'
  const end = findAfter(parent, start, isEnd)

  const startIndex = parent.children.indexOf(start)
  const endIndex = parent.children.indexOf(end)

  const between = parent.children.slice(
    startIndex,
    endIndex > 0 ? endIndex : undefined
  )

  const id = toSlug(header_value)

  console.log(`${customClass}`)

  const section = {
    type: 'section',
    depth: depth,
    children: between,
    data: {
      hName: 'section',
      hProperties: {
        className: `node-level-${depth}` + `${customClass}`,
        id: `${id}`,
        "data-access": access,
      },
    }
  }

  parent.children.splice(startIndex, section.children.length, section)
}
