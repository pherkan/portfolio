---
title: How to redirect to a different URL when selecting a variant on your
  Shopify product page
date: 2020-10-15T12:23:39.598Z
summary: Modify Fernfolio to meet your needs
tags:
  - Shopify
  - Webdevelopment
---
![Screenshot of a product page with 2 variants.](/src/assets/img/screenshot-of-a-product-page-with-2-variants.jpeg)



This step-by-step guide/tutorial will show you how to create custom buttons that replace the default variant options on your Shopify product page and link to different product pages for each variant. This way, you can display different information and optimize your SEO and marketing strategies for each variant.

Shopify lets you create variants for your products, which is useful. However, sometimes you may want to have separate product pages for each variant, especially if they have different features or benefits that need more explanation.



### **Let’s start!**

#### **Step 1:**

make sure that you have created the variants of your products. So if you have three products, create 3 separate products.

![Screenshot showing 3 products that are active.](/src/assets/img/screenshot-showing-3-products-that-are-active.jpeg)

Screenshot of 3 active products

#### Step 2:

Scroll down and check what the product handle is of each of your products as we will need this later. Note this down, or remember it. :-)

![](/src/assets/img/image-2.jpeg)

Product handle

The handle is the part after /products/…

#### Step 3:

Now we will need to know what the css styling is of the existing variant buttons. For that, open the product page in your browser, inspect the element and tap on the variant button. In my case, my unique product has still two variants. If yours doesn’t; make sure to have a variant so you can select the variant button.

![Screenshot showing inspect element and one variant button being targeted.](/src/assets/img/screenshot-showing-inspect-element-and-one-variant-button-being-targeted.jpeg)

Inspect elements (left), targeted variant button (right).

Make sure to copy the entire styling. I will add how the code looks for me below. This also includes the active and inactive state which is very important.

```
.custombutton {
border: var( - variant-pills-border-width) solid rgba(var( - color-foreground),var( - variant-pills-border-opacity));
background-color: rgb(var( - color-foreground));
border-radius: var( - variant-pills-radius);
color: rgb(var( - color-background));
display: inline-block;
text-decoration: none;
margin: .7rem .5rem .2rem 0;
padding: 1rem 2rem;
font-size: 1.4rem;
letter-spacing: .1rem;
line-height: 1;
text-align: center;
transition: border var( - duration-short) ease;
cursor: pointer;
position: relative;
}
.custombutton.active {
background-color: rgb(var( - color-foreground));
color: rgb(var( - color-background));
}
.custombutton.inactive {
background-color: rgb(var( - color-background));
color: rgb(var( - color-foreground));
}
```

#### Step 4:

Now we will add this css code in a separate file. We can do this by going to ‘Online store’, afterwards to ‘Edit code’. Scroll down to ‘Assets’ and tap on ‘Add a new asset’. Choose the ‘Blank file’ and give it a name (e.g. ‘custombutton’).

![screenshot showing add a new asset and a user interface to create a blank file and enter a name for the file](/src/assets/img/screenshot-showing-add-a-new-asset-and-a-user-interface-to-create-a-blank-file-and-enter-a-name-for-the-file.jpeg)

Add a new asset (left), create a blank file named custombutton (right)

Make sure to copy the code given above and add it to this file.

#### Step 5:

Once you have saved the above file, open the **main-product.liquid** file. Search for the product title and add the following code below the product title:

```
{% if product.handle == 'handle1' or product.handle == 'handle2' or product.handle == 'handle3' %}
<legend class="form__label">Label</legend>
<a class="custombutton {% if product.handle == 'handle1' %}active{% else %}inactive{% endif %}" href="/products/handle1">Handle 1</a>
<a class="custombutton {% if product.handle == 'handle2' %}active{% else %}inactive{% endif %}" href="/products/handle2">Handle 2</a>
<a class="custombutton {% if product.handle == 'handle3' %}active{% else %}inactive{% endif %}" href="/products/handle3">Handle 3</a>
{% else %}
{% endif %}
```

Keep in mind, in this example I assume the product’s handle is ‘handle1’, ‘handle2’, ‘handle3’.

#### Step 6:

Now we are going to make sure these buttons use the correct styling, for that we add the following code **at the top** of **main-product.liquid**

{% raw %}
```
{{ 'custombutton.css' | asset_url | stylesheet_tag }}
```
{% raw %}

This will make sure to use the correct/same styling as the variant button.



- - -



That’s it. You will now have three extra buttons that are clickable and will open in a new screen.

The image below shows ‘Variant 1’ which consists of 3 sub-variants: Handle 1, 2 and 3. Clicking on any of these will open a different product page.

Variant 2 is a ‘real’ variant that allows your customers to change a variant of a certain product without leaving that page.

![Screenshot of a product page with 2 variants.](/src/assets/img/screenshot-of-a-product-page-with-2-variants.jpeg)



This article was written on March 1, 2023. With Shopify changing things up now and then, keep in mind that you might need some LLM'ing to get to the right results. Good luck!