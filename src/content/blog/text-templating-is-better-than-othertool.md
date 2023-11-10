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

/* Notes */
With the proliferation of infrastructure-as-code (IaC), everybody is writing some kind of markup to declare their infrastructure. And fairly, we don't want to repeat ourselves when we reuse components or deploy to multiple environments, so we want to parameterise our markup. Certain requirements come in and we need to start doing some more complex adjustments to our markup. Conditionals, loops, compound expressions. We begin to realise that our markup language is not a programming language and we start to look for ways to make it one. The developers really like {{programmingLanguage}} so they begin writing a library which generates the markup file they need with a domain-specific interface. The infrastructure folks refuse to have their beloved YAML pryed from their hands so they instead choose to write macros interpreted by the server.


Text templating is a happy medium between using a programming language to generate markup and using a markup language to generate markup.

Programming languages which generate markup such as JSX and CDKs can be difficult to read and become verbose and difficult to debug. You run the risk of bleeding logic into your markup making it difficult to maintain. Strong design standards and patterns can help to mitigate this, but I believe that any tool with sufficient footguns is not the right tool for the job.

On the other hand you have markup languages which generate markup. These tools often start their lives as innocent parameterised files, but update after update, more complex macros are introduced until you're at the point where your parameter substitution engine becomes a full blown interpreter and you are left writing unchecked YAML somehow creating a worse experience than programming with a dynamically typed language hoping that the JSON Schema magically downloaded into your VSCode session will save you. Yes, I am looking squarely at you, CloudFormation.

It doesn't have to be this way. You don't need to write logic in markup and markup in logic. Just use text templating. I'm sure that you're already familiar with text templating, and there was some specific use case which seemed difficult to achieve with text templating alone and you're right. Using text templating all by itself while trying to achieve a certain level of complexity is frustrating and at times impossible. This is likely what drove you to using those deviously convenient CloudFormation macros or a CDK in the first place. But there is one missing piece of the puzzle that makes the simple constructs of a logicless text templating tool enough to achieve anything you need.

Add a preprocessing step. Take whatever shape of input data you were using to generate your markup and preprocess it into a shape that is easy to work with in your text templating tool. Use JavaScript, Python, or even jq. Turn complex nested objects into flat discriminated structures and convert your enums into flags. You don't need to compromise on the readability of your markup or the expressiveness of your input data. You can have both.