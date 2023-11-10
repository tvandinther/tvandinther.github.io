---
title: "Text templating is better than {{otherTool}}"
description: "An underdog in the IaC toolbox, text templating is a better idea than you think."
date: 2023-11-10T21:56:00+1:00
# lastUpdated: 2023-02-08T00:03:00+13:00
image:
  url: "/assets/images/blog/10-reasons-medium_banner.png"
  alt: "Blog post banner image"
author: "Tom van Dinther"
tags: ["DevOps"]
categories: ["Discussion"]
---
With the proliferation of infrastructure-as-code (IaC), everybody is writing some kind of markup to declare their infrastructure. And fairly, we don't want to repeat ourselves when we reuse components or deploy to multiple environments, so we want to parameterise our markup. Certain requirements come in and we need to start doing some more complex adjustments to our markup. Conditionals, loops, compound expressions. We begin to realise that our markup language is not a programming language and we start to look for ways to make it one. The developers really like {{programmingLanguage}} so they begin writing a library which generates the markup file they need with a domain-specific interface. The infrastructure folks refuse to have their beloved YAML pryed from their hands so they instead choose to write macros interpreted by the server.

Programming languages which generate markup such as JSX and CDKs can be difficult to read and become verbose and difficult to debug. You run the risk of bleeding logic into your markup making it difficult to maintain. Strong design standards and patterns can help to mitigate this, but I believe that any tool with sufficient footguns is not the right tool for the job.

On the other hand you have markup languages which generate markup. These tools often start their lives as innocent parameterised files, but update after update, more complex macros are introduced until you're at the point where your parameter substitution engine becomes a full blown interpreter and you are left writing unchecked YAML somehow creating a worse experience than programming with a dynamically typed language hoping that the JSON Schema magically downloaded into your VSCode session will save you. Yes, I am looking squarely at you, CloudFormation.

It doesn't have to be this way. You don't need to write logic in markup and markup in logic. Just use text templating. Text templating is a happy medium between using a programming language to generate markup and using a markup language to generate markup. I'm sure that you're already familiar with text templating, and there was some specific use case which seemed difficult to achieve with text templating alone and you're right. Using text templating all by itself while trying to achieve a certain level of complexity is frustrating and at times impossible. This is likely what drove you to using those deviously convenient CloudFormation macros or a CDK in the first place. But there is one missing piece of the puzzle that makes the simple constructs of a logicless text templating tool enough to achieve anything you need.

Add a preprocessing step. Take whatever shape of input data you were using to generate your markup and preprocess it into a shape that is easy to work with in your text templating tool. Use JavaScript, Python, or even jq. Turn complex nested objects into flat discriminated structures and convert your enums into flags. You don't need to compromise on the readability of your markup or the expressiveness of your input data. You can have both.

---
Considering the flow of your draft, it would be more effective to introduce the concept of *preprocessed* text templating earlier in the post. This way, when you bring up the historical context and analogy with web frameworks, your readers will already have a basic understanding of what preprocessed text templating entails. Here's a revised structure to accommodate this change:

### Introduction
1. **Overview of Infrastructure-as-Code (IaC):** Introduce IaC and its importance in modern infrastructure management.

With the proliferation of infrastructure-as-code (IaC), everybody from developers to infrastructure specialists are writing markup to declare their resources. IaC is just one part of the anything-as-code movement and I welcome it as a way to define anything from infrastructure to diagrams to documentation. The reason the anything-as-code movement is so popular is because of its natural synergy with version control systems (VCS). We glean all of the benefits of VCS such as scalability and replayability because we are simply dealing with text.

2. **Initial Problem Statement:** Discuss the challenges with markup languages in IaC, emphasizing the need for parameterization.

But in the land of IaC, we often need to repeat ourselves such as when we reuse components or declare resources in multiple environments. Therefore the natural progression is to parameterise our markup. However, markup is static so we need to introduce dynamism either by preprocessing it with some basic text substitution, or postprocessing it through an extended syntax.

### The Limitations of Current Approaches
3. **Complexity in Markup Languages:** Explore the advanced requirements and limitations of markup languages.

These approaches work well until we want to use higher levels of abstraction to define our resources. We need conditionals, loops, mappings, transforms, string operations, and compound expressions. We begin to realise that our markup language is not a programming language and so we start to look for ways to make it one.

4. **Developers' and Infrastructure Specialists' Responses:** Contrast how developers lean towards programming languages for generating markup, while infrastructure specialists prefer to keep using familiar markup languages with server-interpreted macros.

Developers with their love of {{favouriteProgrammingLanguage}} move deeper into preprocessing their markup by writing a library which generates the markup file they need through a domain-specific interface. Infrastructure specialists with their time-tested ~~XML~~ ~~JSON~~ ~~YAML~~ TOML decide to power up their markup language of choice with server-interpreted macros. Now at the AWS conference, the developers are telling everyone how they should be using the CDK and the infrastructure guys are not in attendance because they're at home writing custom CloudFormation macros.

### Challenges with Existing Solutions

Postprocessing your markup by supercharging it with macros is turning a string substitution engine into a full blown interpreter. You are left writing unchecked YAML, creating a worse experience than programming with a dynamically typed language and foolishly hoping that the JSON Schema magically downloaded into your VS Code session from one of the hundred installed extensions will save you.

[!Google Search: How to attach a debugger to YAML]()

I would like to draw your attention to another realm in which we take these different approaches to generating dynamic markup. The web. Specifically, HTML. JSX is an HTML preprocessor as it allows you to generate HTML (markup) with JavaScript. But this produces its own problems and if you dislike JSX (in lieu of React), you probably have the same issues with CDKs. The primary isue is that logic permeates your markup reducing the expressiveness of the markup and the readability of the code. For some, this is considered the price for strong colocation, and that the drawbacks can be mitigated with strong design standards and patterns. Though any tool with sufficient footguns is not the right tool for the job.

If you're not using JSX or some derivative, you're probably using a templating language which binds variables within your web framework to the HTML template. This is plain and simple text templating and it is powerful enough to power the web for a long time before React.

### Introducing Preprocessed Text Templating
7. **Concept of Preprocessed Text Templating:** Introduce the idea of preprocessed text templating here, explaining how it incorporates preprocessing to simplify complex data structures for templating.

The secret to making text templating work for your IaC is right there in the best HTML templating engines. Preprocessing. Take whatever shape of input data you were using to generate your markup and preprocess it using {{favouriteProgrammingLanguage}} into a shape that is easy to work with in your text templating tool. Use JavaScript, Python, Go, Haskell or even jq. Turn complex nested objects into flat discriminated structures and convert your enums into flags. You don't need to compromise on the expressiveness of your markup or the readability of your code. You can have both.

> Keep it simple. Use a logicless templating spec such as [mustache](https://mustache.github.io/) to remove any footguns.

A markup file with simple templating directives is easy to read. Templates are inherently declarative and so they do not interrupt the flow of the markup. Simple constructs such as substitutions, list expansions, positive blocks and negative blocks are a lot easier to mentally parse than the the imperative alternatives. You also retain control over the generation process, so debugging is as simple as checking the output before it gets sent to the the parser.

With this decoupled solution, I surmise that there is no requirement that cannot be met by the simple two-step process of preprocessing and templating. You can utilise the full power of whichever tooling you need for the preprocessing of data before passing it to your templating engine saving you from blockers when the alternative combined tooling is not powerful enough to meet your requirements.

I've worked on a project that utilised text templating and I've worked on a project that pushed the limits of postprocessing (is CloudFormation turing complete yet?). In both cases the final artifact was a CloudFormation template. The project which utilised text templating was able to grow to high levels of complexity to meet requirements without sacrificing readability or maintainability. Meanwhile, the supercharged templates of CloudFormation were not enough to satisfy the growing requirements of the templating and despite the lower levels of relative complexity, the readability and maintainability of the templates plummeted.

### Conclusion
13. **Summarize the Argument:** Recap the key points, emphasizing the balance and effectiveness of preprocessed text templating.
14. **Final Thoughts:** Conclude with personal insights or a call to action, encouraging readers to consider this approach for their IaC needs.

Don't sleep on text templating. We respect the power of text templating on the web, so why not in IaC? It's time to stop writing logic in markup and markup in logic. Just use text templating and save yourself the headache. It's not fancy or new but it is damn effective. 

Just make sure to run it through your templating engine before you send it to the parser.

Thanks for reading, {{name}}.