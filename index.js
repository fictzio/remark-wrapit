//const findAfter = require('unist-util-find-after')
//const visit = require('unist-util-visit-parents')
import { findAfter } from 'unist-util-find-after'
import { visitParents } from 'unist-util-visit-parents'

const MAX_HEADING_DEPTH = 6

export default function wrapit () {
  return transform
}

function transform (tree) {
  for (let depth = MAX_HEADING_DEPTH; depth > 0; depth--) {
    visitParents(
      tree,
      node => node.type === 'heading' && node.depth === depth,
      wrapitMain
    )
  }
}

/*
* toSlug
* ! Simplify this one
* TODO: Refactor to remove nested ifs
* @param text
*/
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

function getTarget(text) {
  if (text.indexOf('(@') > 0) {
    let regExp = /\(@([^)]+)\)/;
    let target = regExp.exec(text)
    return target[1]
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

function wrapitMain (node, ancestors) {
  let header_value = node.children[0].value

  const Target = getTarget(header_value)
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

  const section = {
    type: 'section',
    depth: depth,
    children: between,
    data: {
      hName: 'section',
      hProperties: {
        className: `node-level-${depth}` + `${customClass}`,
        id: `${id}`,
        "data-Target": Target,
      },
    }
  }

  parent.children.splice(startIndex, section.children.length, section)
}
