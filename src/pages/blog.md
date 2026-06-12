---
layout: blog.njk
metaDescription: blog page with blogposts written by pherkan
date: 2017-01-01
permalink: blog{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber
  }}{% endif %}/index.html
subtitle: A collection of technical blogposts and random thoughts
title: Blogposts
eleventyNavigation:
  key: Blog
  order: 2
pagination:
  data: collections.post
  size: 20
---
Sometimes I like to write about things that I like, sometimes.
