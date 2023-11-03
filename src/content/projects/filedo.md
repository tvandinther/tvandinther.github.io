---
title: filedo
description: A command-line utility to perform actions on targeted files.
date: 2022-10-01T12:00:00+12:00
banner: 
  url: /assets/images/projects/filedo_banner.png
  alt: filedo banner
sourceCodeUrl: https://github.com/tvandinther/filedo
---
The initial goal was to write a command-line utility that aided the deployment of various IaC organised in a particular file structure. As I designed the solution, it became clear that a general approach to running commands against globs of files using a recursive structure would be extremely beneficial to more than just deploying IaC.

This open-source tool is written in Haskell and continues to receive development. It has two complementary features; a JSON / YAML data merge and file templating using Mustache syntax. These features are all rolled into the final process command or accessed separately.