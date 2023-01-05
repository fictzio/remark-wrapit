import { findAfter } from 'unist-util-find-after'
import { visitParents } from 'unist-util-visit-parents'
import { visit } from 'unist-util-visit'
import hash from 'object-hash'

const MAX_HEADING_DEPTH = 6

let headers = []
let lastLevel = 0
let lastHeader = ''

export default function wrapit () {
  return transform
}

function transform (tree) {
  // Create sections and add metadata
  for (let depth = MAX_HEADING_DEPTH; depth > 0; depth--) {
    visitParents(
      tree,
      node => node.type === 'heading' && node.depth === depth,
      wrap
    )
  }

  visit(tree, 'heading', node => {
    let depth = node.depth
    let slug

    // Set the header ID

    // Remove parenthesis from header
    visit(node, 'text', textNode => {
      let hasParenthesis = textNode.value.indexOf('(')
      slug = toSlug(textNode.value) + ''

      if (depth > lastLevel) {
        lastHeader = headers[headers.length - 1]
        headers.push(slug)
      } else if (depth === lastLevel) {
        headers[headers.length - 1] = slug
        lastHeader = headers[headers.length - 2]
      } else {
        for (let i = depth;i < lastLevel;i++) {
          headers.pop()
        }

        headers[headers.length - 1] = slug
        lastHeader = headers[headers.length - 1]
      }

      if (hasParenthesis > -1) {
        textNode.value = textNode.value.substring(0, hasParenthesis)
      }
    })

    let id = lastHeader + '__' + slug
    // Set Header ID
    if (lastHeader === slug) {
      id = slug
    }

    node.data = {
      "hProperties":{
        "id":id,
      }
    }

    lastLevel = depth
  })
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

/* Function
* Gets the target of a section
* TODO: Not used. Use
*/
function getTarget(text) {
  if (text.indexOf('(@') > 0) {
    let regExp = /\(@([^)]+)\)/;
    let target = regExp.exec(text)
    return 'data-target="' + target[1]
    .trim()
    .toLowerCase() + '"'
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
    return ' ' + toSlug(text)
  }
}

function wrap (node, ancestors) {
  let header_value = node.children[0].value
  let hasParenthesis = header_value.indexOf('(')

  const target = getTarget(header_value)
  let customClass = getClass(header_value)

  const startNode = node
  const depth = startNode.depth
  const parent = ancestors[ancestors.length - 1]
  const isEnd = node => node.type === 'heading' && node.depth <= depth || node.type === 'export'
  const endNode = findAfter(parent, startNode, isEnd)

  const startIndex = parent.children.indexOf(startNode)
  const endIndex = parent.children.indexOf(endNode)

  const between = parent.children.slice(
    startIndex,
    endIndex > 0 ? endIndex : undefined
  )

  // Create checksum from content
  const checksumHeaders = (() => {
    return hash.keysMD5(header_value)
  })()

  if (hasParenthesis>-1) {
    header_value = header_value.substring(0, hasParenthesis)
  }

  const slug = toSlug(header_value)

  const section = {
    type: 'section',
    depth: depth,
    children: between,
    data: {
      hName: 'section',
      hProperties: {
        //id: `${slug}_${checksumHeaders}`,
        id: `${slug}`,
        className: `node-level-${depth}` + `${customClass}`,
        "data-sum": `${checksumHeaders}`,
        "data-slug": `${slug}`,
        "data-label": `${header_value}`
      },
    }
  }

  // Add new section to parent node
  parent.children.splice(startIndex, section.children.length, section)
}
