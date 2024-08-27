$(document).ready(function () {
    function formatRelativeTime(dateString) {
        const now = new Date();
        const pastDate = new Date(dateString);
        const differenceInSeconds = Math.floor((now - pastDate) / 1000);

        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        if (differenceInSeconds < 60) {
            return rtf.format(-differenceInSeconds, 'second');
        } else if (differenceInSeconds < 3600) {
            return rtf.format(-Math.floor(differenceInSeconds / 60), 'minute');
        } else if (differenceInSeconds < 86400) {
            return rtf.format(-Math.floor(differenceInSeconds / 3600), 'hour');
        } else if (differenceInSeconds < 604800) {
            return rtf.format(-Math.floor(differenceInSeconds / 86400), 'day');
        } else if (differenceInSeconds < 2419200) {
            return rtf.format(-Math.floor(differenceInSeconds / 604800), 'week');
        } else if (differenceInSeconds < 29030400) {
            return rtf.format(-Math.floor(differenceInSeconds / 2419200), 'month');
        } else {
            return rtf.format(-Math.floor(differenceInSeconds / 29030400), 'year');
        }
    }

    function updateReviewCount(count) {
        const reviewText = count === 1 ? 'review' : 'reviews';
        document.getElementById('total-reviews').textContent = `${count} ${reviewText}`;
        document.getElementById('event-review-count').textContent = `${count} ${reviewText}`;
    }

    function updateAttendeesCount(current, total) {
        document.getElementById('total-attendees').textContent = `${current} / ${total}`;
    }

    // Sticky header
    window.onscroll = function () { myFunction() };

    var header = document.getElementById("myHeader");
    var sticky = header.offsetTop;

    function myFunction() {
        if (window.scrollY > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }

    // Accordion
    // var acc = document.getElementsByClassName("accordion");
    // var i;
    // for (i = 0; i < acc.length; i++) {
    //     acc[i].addEventListener("click", function () {
    //         var panel = this.nextElementSibling;
    //         var arrow = this.querySelector(".down-arrow");

    //         if (panel.style.display === "block") {
    //             panel.style.display = "none";
    //             this.classList.add("btn-padding");
    //             if (arrow) {
    //                 arrow.style.display = "block";
    //             }
    //         } else {
    //             panel.style.display = "block";
    //             this.classList.remove("btn-padding");
    //             if (arrow) {
    //                 arrow.style.display = "none";
    //             }
    //         }
    //     });
    // }

    function truncateText() {
        var textElement = document.getElementsByClassName("text-content")[0];
        var fullText = textElement.innerHTML;
        textElement.setAttribute("data-full-text", fullText);
        var truncated = fullText.substring(0, 300) + "...";
        textElement.innerHTML = truncated;
        textElement.appendChild(showMoreButton);
    };

    function showShimmer() {
        document.querySelectorAll('h1.content, h2.content, h3.content, img.content, p.content, div.content').forEach(element => {
            element.classList.add('shimmer-effect');
            if (element.tagName === 'DIV' && element.classList.contains('content')) {
                element.style.position = 'relative';
                element.querySelectorAll('*').forEach(child => {
                    child.style.visibility = 'hidden'; // Hide the child elements
                });
            }
        });
        document.getElementById('attend-btn').style.display = 'none';
    }

    function hideShimmer() {
        document.querySelectorAll('h1.content, h2.content, h3.content, img.content, p.content, div.content').forEach(element => {
            element.classList.remove('shimmer-effect');
            if (element.tagName === 'DIV' && element.classList.contains('content')) {
                element.querySelectorAll('*').forEach(child => {
                    child.style.visibility = 'visible'; // Show the child elements
                });
            }
        });
        document.getElementById('attend-btn').style.display = 'block';
    }

    function makeApiRequest(url) {
        return $.ajax({
            url: url,
            method: "GET",
            timeout: 0,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
            }
        });
    };

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const product = urlParams.get("eventId");

    if (!product) {
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('error-container').style.display = 'flex';
        return;
    }

    showShimmer();

    const eventUrl = `https://prod-ts-liveliness-server.onrender.com/api/event/${product}`;
    const reviewsAttendeesUrl = `https://prod-ts-liveliness-server.onrender.com/api/event/getCompleteInfo/${product}`;

    Promise.all([makeApiRequest(eventUrl), makeApiRequest(reviewsAttendeesUrl)])
        .then(([eventResponse, reviewsAttendeesResponse]) => {
            hideShimmer();

            // Handle event data
            const eventData = eventResponse;
            // console.log(eventData)
            const date = new Date(eventData.data.trainingStartDateTime);

            // const options = {
            //     weekday: "long",
            //     month: "long",
            //     day: "numeric",
            //     hour: "2-digit",
            //     minute: "2-digit",
            //     hour12: false, // Use 24-hour format
            // };

            const formattedDateParts = {
                weekday: date.toLocaleString("en-US", { weekday: "long" }),
                month: date.toLocaleString("en-US", { month: "long" }),
                day: date.toLocaleString("en-US", { day: "numeric" }),
                time: date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
            };

            const formattedDate = `${formattedDateParts.weekday}, ${formattedDateParts.month} ${formattedDateParts.day} at ${formattedDateParts.time}`;

            // Update DOM elements
            document.getElementById("event-title").textContent = eventData.data.title;
            document.getElementById("event-review").textContent = eventData.data.creator.reviewCount;
            document.getElementById("rating").textContent = eventData.data.creator.reviewCount;
            document.getElementById("event-start-time").textContent = formattedDate;
            document.getElementById("event-location").textContent = eventData.data.trainingLocationString;
            document.getElementById("event-location-map").textContent = eventData.data.trainingLocationString;
            document.getElementById("event-creator-name").textContent = eventData.data.creator.name;
            document.getElementById("event-description").textContent = eventData.data.description;
            const priceElement = document.getElementById("event-price");
            if (eventData.data.price === 0) {
                priceElement.textContent = "Free";
            } else {
                priceElement.textContent = `${eventData.data.priceCurrency} ${eventData.data.price}`;
            }
            document.getElementById("events-remaining-seats").textContent = `${eventData.data.participantsLimit - eventData.data.participants.length} spots left`;
            const imageUrl = eventData.data.creator.mainProfilePhoto;
            document.getElementById("event-host-image").src = imageUrl;
            const imageUrlCover = eventData.data.coverPhotoUrl;
            const optionalPhotos = eventData.data.optionalPhotos;

            const imageContainer = document.getElementById('image-container');
            const carouselContainer = document.getElementById('main-carousel');

            // const blurContainer = document.querySelector('.blur-container');
            // blurContainer.style.setProperty('--blurred-background', `url(${imageUrlCover})`);

            imageContainer.innerHTML = '';

            const imagesHtml = [];
            imagesHtml.push(`<div class="item"><img src="${imageUrlCover}" alt="Cover Photo"></div>`);

            if (optionalPhotos && optionalPhotos.length > 0) {
                optionalPhotos.forEach(photoUrl => {
                    imagesHtml.push(`<div class="item"><img src="${photoUrl}" alt="Optional Photo"></div>`);
                });

                carouselContainer.innerHTML = imagesHtml.join('');
                imageContainer.append(carouselContainer);

                $("#main-carousel").owlCarousel({
                    items: 1,
                    loop: false,
                    nav: false,
                    dots: false,
                    margin: 10
                });
            } else {
                imageContainer.innerHTML = `<img src="${imageUrlCover}" alt="Cover Photo" class="cover_image">`;
            }

            const container = document.getElementById("event-payment");
            container.innerHTML = "";

            const paymentImageMap = {
                credit_card: "./images/credit-card.svg",
                paypal: "./images/paypal.svg",
                cash: "./images/cash.svg",
                free: "./images/cash.svg"
            };

            const paymentTextMap = {
                credit_card: "Credit Card",
                paypal: "Paypal",
                cash: "Cash",
                free: "Free"
            };

            if (eventData.data.paymentMethods.length === 0) {
                const eventElement = document.createElement("div");
                eventElement.classList.add("payment-card");

                const imageUrl = paymentImageMap.free;
                const paymentText = paymentTextMap.free;

                eventElement.innerHTML = `<img src="${imageUrl}"
                                                alt="free"
                                            />
                                            <h3>${paymentText}</h3>
                                        `;

                container.appendChild(eventElement);
            } else {
                eventData.data.paymentMethods.forEach(payment => {
                    const eventElement = document.createElement("div");
                    eventElement.classList.add("payment-card");

                    const imageUrl = paymentImageMap[payment];
                    const paymentText = paymentTextMap[payment];

                    eventElement.innerHTML = `<img src="${imageUrl}"
                                                    alt="${payment}"
                                                />
                                                <h3>${paymentText}</h3>
                                            `;

                    container.appendChild(eventElement);
                });
            }

            var mapProp = {
                center: new google.maps.LatLng(eventData.data.trainingLocation.coordinates[0], eventData.data.trainingLocation.coordinates[1]),
                zoom: 6,
                disableDefaultUI: true,
                styles: [{
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "saturation": 36
                    }, {
                        "color": "#484848"
                    }, {
                        "lightness": 30
                    }]
                }, {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [{
                        "visibility": "on"
                    }, {
                        "color": "#000000"
                    }, {
                        "lightness": 6
                    }]
                }, {
                    "featureType": "all",
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "administrative",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#000000"
                    }, {
                        "lightness": 0
                    }]
                }, {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [{
                        "color": "#000000"
                    }, {
                        "lightness": 17
                    }, {
                        "weight": 1.2
                    }]
                }, {
                    "featureType": "administrative",
                    "elementType": "labels",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "administrative.country",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "simplified"
                    }]
                }, {
                    "featureType": "administrative.country",
                    "elementType": "geometry",
                    "stylers": [{
                        "visibility": "simplified"
                    }]
                }, {
                    "featureType": "administrative.country",
                    "elementType": "labels.text",
                    "stylers": [{
                        "visibility": "simplified"
                    }]
                }, {
                    "featureType": "administrative.province",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "administrative.locality",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "simplified"
                    }, {
                        "saturation": "-100"
                    }, {
                        "lightness": "20"
                    }]
                }, {
                    "featureType": "administrative.neighborhood",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "administrative.land_parcel",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "simplified"
                    }, {
                        "gamma": "0.00"
                    }, {
                        "lightness": "64"
                    }]
                }, {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#000000"
                    }, {
                        "lightness": 10
                    }]
                }, {
                    "featureType": "landscape.man_made",
                    "elementType": "all",
                    "stylers": [{
                        "lightness": "3"
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{
                        "visibility": "off"
                    }]
                }, {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#000000"
                    }, {
                        "lightness": 1
                    }]
                }, {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{
                        "visibility": "simplified"
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#383838"
                    }, {
                        "lightness": 7
                    }]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry.stroke",
                    "stylers": [{
                        "color": "#383838"
                    }, {
                        "lightness": 9
                    }, {
                        "weight": 0.2
                    }]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#383838"
                    }, {
                        "lightness": 8
                    }]
                }, {
                    "featureType": "road.local",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#383838"
                    }, {
                        "lightness": 6
                    }]
                }, {
                    "featureType": "transit",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#000000"
                    }, {
                        "lightness": 9
                    }]
                }, {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#000000"
                    }, {
                        "lightness": 7
                    }]
                }],
            };

            // Initialize the map
            var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

            // Define the position for the marker
            var myLatLng = new google.maps.LatLng(eventData.data.trainingLocation.coordinates[0], eventData.data.trainingLocation.coordinates[1]);

            // Define a custom icon
            var customIcon = {
                url: "./images/map_pin.svg", // URL to your custom icon image
                scaledSize: new google.maps.Size(50, 50), // Size of the icon (optional)
                origin: new google.maps.Point(0, 0), // Origin of the image (optional)
                anchor: new google.maps.Point(25, 50) // Anchor of the icon (optional)
            };

            // Add the custom marker to the map
            new google.maps.Marker({
                position: myLatLng,
                map: map,
                icon: customIcon, // Set the custom icon
            });

            // Handle Attendees
            const attendees = reviewsAttendeesResponse.data.participants;
            const attendeeContainer = document.getElementById('attendees-container');
            attendeeContainer.innerHTML = '';
            const limitedAttendees = attendees.slice(0, 8);

            if (limitedAttendees.length < 4) {
                attendeeContainer.classList.add('align-left');
            } else {
                attendeeContainer.classList.remove('align-left');
            }

            limitedAttendees.forEach(attendee => {
                const attendeeCardHtml = `
                        <div class="attendees-card">
                            <div class="attendees-circle">
                                <img src="${attendee.mainProfilePhoto}" alt="${attendee.name}">
                            </div>
                            <h3>${attendee.name}</h3>
                        </div>
                `;
                attendeeContainer.innerHTML += attendeeCardHtml;
            });

            const currentAttendees = attendees.length;
            const totalAttendees = eventData.data.participantsLimit;
            updateAttendeesCount(currentAttendees, totalAttendees);

            function adjustLastSlideWidth() {
                const slides = document.querySelectorAll('.swiper-slide');
                if (slides.length > 0) {
                    // Remove width adjustment from all slides
                    slides.forEach(slide => {
                        slide.style.width = '70%';
                    });

                    // Set the last slide to full width
                    slides[slides.length - 1].style.width = '90%';
                }
            }
            // Handle Reviews
            const reviews = reviewsAttendeesResponse.data.reviews;
            const reviewsContainer = document.getElementById('reviews-carousel');
            reviewsContainer.innerHTML = '';
            const filteredReviews = reviews.filter(review => review.review && review.review.trim() !== '');
            filteredReviews.forEach(review => {
                const reviewDate = formatRelativeTime(review.createdAt);
                const reviewCardHtml = `
                    <div class="swiper-slide">
                        <p>${review.review}</p>
                        <div class="host-reviews-info">
                            <div class="host-circle">
                                <img src="${review.reviewer.mainProfilePhoto}" alt="${review.reviewer.name}">
                            </div>
                            <div class="host-reviews">
                                <h2>${review.reviewer.name}</h2>
                                <p>${reviewDate}</p>
                            </div>
                        </div>
                    </div>`;
                reviewsContainer.innerHTML += reviewCardHtml;
            });

            updateReviewCount(reviews.length);

            var swiper = new Swiper(".mySwiper", {
                slidesPerView: 'auto',
                spaceBetween: 10,
                on: {
                    // On initialization complete, adjust the width of the last slide
                    init: function () {
                        adjustLastSlideWidth();
                    },
                    // On slide change, ensure the last slide is adjusted (in case slides are dynamically added or removed)
                    slideChange: function () {
                        adjustLastSlideWidth();
                    }
                }
            });
        })
        .catch(error => {
            hideShimmer();
            // console.error('Error fetching data:', error);
        });
});
