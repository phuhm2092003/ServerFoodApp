/*!
* Start Bootstrap - Agency v7.0.11 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
    window.addEventListener('load', function () {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const status = urlParams.get('status');
        if (status === 'insert-success') {
            alert('Product inserted successfully');
            window.location.replace("http://localhost:3000/");
        }else if(status === 'name-and-price-empty'){
            alert('Product name and price is empty!');
            window.location.replace("http://localhost:3000/");
        }else if(status === 'image-empty'){
            alert('Product image is empty!');
            window.location.replace("http://localhost:3000/");
        }else if(status === 'price-not-integer'){
            alert('Price is a invalid!');
            window.location.replace("http://localhost:3000/");
        }else if(status === 'delete-product-failed'){
            alert('Product delete failed!');
            window.location.replace("http://localhost:3000/");
        }else if(status === 'delete-product-success'){
            alert('Delete product successful!');
            window.location.replace("http://localhost:3000/");
        }
    });  
});
