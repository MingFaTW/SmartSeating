# Use the official PHP image with Apache as the base image
FROM php:7.4-apache

# Install mysqli extension
RUN docker-php-ext-install mysqli

# Enable the Apache rewrite module
RUN a2enmod rewrite

# Copy your application files to the Apache server's document root
COPY public-html/ /var/www/html/

# Set the working directory
WORKDIR /var/www/html
