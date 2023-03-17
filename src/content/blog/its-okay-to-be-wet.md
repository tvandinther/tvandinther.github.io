---
title: "It's Okay To Be WET"
description: "A critical look at the popular principle of \"Don't Repeat Yourself\" (DRY)"
date: 2023-03-16T22:50:00+12:00
# lastUpdated: 2023-02-08T00:03:00+13:00
draft: true
author: "Tom van Dinther"
tags: ["hot take"]
categories: ["discussion"]
featured: true
---
You will have probably heard of the idea of **D**on’t **R**epeat **Y**ourself (DRY). It’s often over-emphasised as a golden rule of software development — that duplicated code should be avoided. This type of refactoring isn't free, so consider whether the cost is worth the potential benefits. What if there is value in repeating yourself and **W**rite **E**verything **T**wice (WET)?

> The price of the DRY refactor is *coupling*.
> 

The price of the DRY refactor is *coupling*. Once you extract a piece of common logic, every piece of code using it is now transitively coupled. Each time you use it, the cost of change increases.

## What if I create the right abstraction?

Of course, you could implement a carefully designed interface at the right level of abstraction such that the repercussions of changes to the extracted logic are contained. But no abstraction is perfectly immune to breaking changes. When the time comes to implement the breaking change, the cost is multiplied by each dependency it has.

I should acknowledge the value a good abstraction can bring. A good abstraction can reduce the cost of non-breaking changes significantly. However, ignoring the associated costs will not make them go away. A good abstraction requires a clear understanding of the problem, thoughtful design and iterative development to hone into the right balance of public and private concerns. This development time is an extra cost of abstraction.

## Repeated syntax does not always mean a repeated idea

It is easy to look at a piece of code, see a common group of tokens across several lines and conclude that it is a repeated bit of logic that requires extraction. However, this is just syntax. The syntax exists within a context that represents a more significant idea, and if this idea is different between these two pieces of code, they will be subject to different forces of change. Extracting the common pattern in this scenario will cause pain when the ideas diverge.

## When is it okay to be WET?

When the cost of abstraction outweighs the value it provides.

A poor abstraction will run you in the negatives; a good abstraction takes work. Evaluating this can be difficult, but as the size of the extraction increases, so does its impact, and the amount of consideration it requires should grow with it. Extracting a duplicated statement or expression into a local function can be done almost subconsciously. Creating a new microservice, on the other hand, requires careful consideration.

The choice between adhering to the DRY principle and allowing some repetition in code is not always straightforward. While the DRY principle can lead to cleaner, more maintainable code, it can also introduce coupling and increase the cost of change. On the other hand, embracing the WET approach can sometimes provide benefits when the cost of abstraction outweighs its value, or when seemingly similar code represents different ideas that may diverge in the future. As software developers, it's essential to carefully consider the trade-offs between these two principles and make informed decisions based on the specific context of each situation. Remember, the key is finding the right balance between abstraction and repetition to maximize your code's efficiency, maintainability, and adaptability.

So the next time you’re about to extract repetition, consider the implications. You may be better off without it.