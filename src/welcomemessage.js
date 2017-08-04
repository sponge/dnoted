// markdown string for the default tutorial message when user doesn't have index.md
export default `
# Welcome to dNoted!
You're seeing this page because you don't have an index.md in your dNoted folder in your Dropbox. Create a new file
named /index.md and replace me with your own stuff!

Easy. Fast. Beautiful. Three words that this isn't. dNoted is apersonal Wiki that loads and saves directly from your
Dropbox. Because everything is just a Markdown file, you can editeverything either in dNoted, or any other text editor
of your choice.

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

and they'll render like this:

- [ ] an incomplete task
- [x] a completed task
`