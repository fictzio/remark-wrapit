# remark-wrapit

This is a [remark](https://github.com/remarkjs/remark) plugin to wrap each heading and the content that follows it in a wrapper tag of your choice. For now it `<section>` is used as wrapper but it will support custom sets of wrapper tags based on heading depth.

The plugin is based on [Jake Lows remark-sectionize plugin](https://github.com/jake-low/remark-sectionize) but has an addition set of features to allow more granular CSS styling as well as the possibility to handle use cases where each section is targeted to a specific user/role.

The wrapper tags can be generated inserted down to a certain header level to allow for splitting large documents.

Each section recieves an ID created from a checksum of subsequent headings on the next level.

## Goal

- Set start and max depth
- Select your own set of wrapper tags depending on header depth
- Support MDSVX wrapper tags
- Support custom IDs
- Support custom classes
- Support targeted sections

## Section ID

Section IDs are generated from a checksum of the headers on the next level. The order does not change the checksum.
## Slug

The slug is generated from the heading. All content within parenthesis are removed and the string is turned into a valid slug.

## Custom ID, class and target

The plugin supports custom classes, custom id and section targes. Since the plugin is used in conjuction with MDX, parenthesis is used instead of curly brackets.

### Syntax

By adding `(#ID)` to the heading the wrapper tag will recieve that specific ID.

By adding `(.class)` to the heading the wrapper tag will recieve that class.

By adding `(@name)` to the heading the wrapper tag will recieve an attribute `data-target="@name"`.

## Example

When using `remark-wrapit`, given the following markdown:

```md
# Sunday morning

## Waking up (.step)

You wake up to the sound of an alarm. The clock beside you shows that it's 8:00 AM. It is too early to get up. You roll over and fall asleep again.

## Oversleeping (.step)

You look to your alarm. It's now 10:42 AM. You were supposed to meet your girlfriend at her place at 10.
```

...remark will output the following HTML:

```html

<section id="sunday_morning" class="node-level-1">
  <h1>Sunday morning</h1>
  <section id="waking_up" class="node-level-2 step">
    <h2>Waking up</h2>
    <p>You wake up to the sound of an alarm. The clock beside you shows that it's 8:00 AM. It is too early to get up. You roll over and fall asleep again.</p>
  </section>
  <section id="oversleeping" class="node-level-2 step">
    <h2>Oversleeping</h2>
    <p>You look to your alarm. It's now 10:42 AM. You were supposed to meet your girlfriend at her place at 10.</p>
  </section>
</section>
```

You now have multiple options for CSS styling. The combination of wrapper tags with IDs and classes allows for Markdown to be converted into HTML that not only are treated as top-down documents. One great use case is to visually rearrange the content throug CSS grids and named grid-areas.

## License

This repository is licensed under the MIT license; see the LICENSE file for details.
