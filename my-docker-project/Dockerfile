FROM php:7.4-apache

RUN docker-php-ext-install mysqli

RUN a2enmod rewrite

COPY public-html/ /var/www/html/

WORKDIR /var/www/html
