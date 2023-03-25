---
title: Stocker
description: Automated build of container images from tags of external GitHub repositories.
date: 2023-03-01T12:00:00+12:00
banner: /assets/images/projects/stocker_banner.png
sourceCodeUrl: https://github.com/tvandinther/stocker
---
In my work, I use containerised tools extensively. Rather than installing a tool locally for specific tasks that live with the code, I run the tool via a container image. However, some of these tools do not release in a container image. I built stocker to automate the creation of these images based on new releases of tracked upstream repositories. This allows me to spend more time solving the problems these tools are helpful for and less time managing the container build and repository.

I purposefully designed stocker to be a self-contained GitHub repository meaning that anybody can fork the repository and make it fit their needs, whether tracking private repositories or pushing to their own container registry.