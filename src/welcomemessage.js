// markdown string for the default tutorial message when user doesn't have index.md
export default `
# Welcome to dNoted!
You're seeing this page because you don't have an index.md in your dNoted folder in your Dropbox. Create a new file
named /index.md and replace me with your own stuff!

Easy. Fast. Beautiful. Three words that don't describe this at all. dNoted is a personal Wiki that loads and saves
directly from your Dropbox. Because everything is just a Markdown file, you can editeverything either in dNoted, or any
other text editor of your choice.

## Links

You can link to other pages:
\`\`\`
[Relative link to a page in the same folder](./page2.md)
[Absolute links](/path/to/another file.md)
\`\`\`

## Task Lists

dNoted will sync up progress on task lists to your Dropbox, allowing for lists that you can quickly update (just not
this one because this intro isn't on your Dropbox!)

\`\`\`
- [ ] an incomplete task
- [x] a completed task
\`\`\`

and they'll render like this (try clicking them too!)

- [ ] an incomplete task
- [x] a completed task

## The rest of that Markdown stuff

### Basics

\`\`\`
*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

~~This text will be striked through~~
\`\`\`

### Headers
\`\`\`
# This is an <h1> tag
## This is an <h2> tag
###### This is an <h6> tag
\`\`\`

### Images
\`![Image Alt Text](image url)\`

### Lists

#### Unordered

\`\`\`
- Item 1
- Item 2
  - Item 2a
  - Item 2b
\`\`\`

#### Ordered

\`\`\`
1. Item 1
1. Item 2
1. Item 3
   1. Item 3a
   1. Item 3b
\`\`\`

### Tables

\`\`\`
First Header | Second Header
----------------------------| ----------------------------
Content from cell 1         | Content from cell 2
Content in the first column | Content in the second column
\`\`\`
`