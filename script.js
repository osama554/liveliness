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

    function showLoader() {
        document.getElementById('loader').style.display = 'flex';
    }

    function hideLoader() {
        document.getElementById('loader').style.display = 'none';
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

    showLoader();

    const eventUrl = `https://prod-ts-liveliness-server.onrender.com/api/event/${product}`;
    const reviewsAttendeesUrl = `https://prod-ts-liveliness-server.onrender.com/api/event/getCompleteInfo/${product}`;

    Promise.all([makeApiRequest(eventUrl), makeApiRequest(reviewsAttendeesUrl)])
        .then(([eventResponse, reviewsAttendeesResponse]) => {
            hideLoader();

            // Handle event data
            const eventData = eventResponse;
            const date = new Date(eventData.data.trainingStartDateTime);

            const options = {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // Use 24-hour format
            };

            const formattedDate = date.toLocaleString("en-US", options)
                .replace(",", " at"); // Replace comma after the day with " at"

            // Update DOM elements
            document.getElementById("event-title").textContent = eventData.data.title;
            document.getElementById("event-review").textContent = eventData.data.creator.reviewCount;
            document.getElementById("rating").textContent = eventData.data.creator.reviewCount;
            document.getElementById("event-start-time").textContent = formattedDate;
            document.getElementById("event-location").textContent = eventData.data.trainingLocationString;
            document.getElementById("event-location-map").textContent = eventData.data.trainingLocationString;
            document.getElementById("event-creator-name").textContent = eventData.data.creator.name;
            document.getElementById("event-description").textContent = eventData.data.description;
            document.getElementById("event-price").textContent = `${eventData.data.priceCurrency} ${eventData.data.price}`;
            document.getElementById("events-remaining-seats").textContent = `${eventData.data.participantsLimit - eventData.data.participants.length} spots left`;
            const imageUrl = eventData.data.creator.mainProfilePhoto;
            document.getElementById("event-host-image").src = imageUrl;
            const imageUrlCover = eventData.data.coverPhotoUrl;
            const optionalPhotos = eventData.data.optionalPhotos;
            const imageContainer = document.getElementById('image-container');
            const carouselContainer = document.getElementById('main-carousel');
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
                    items: 1.2,
                    loop: true,
                    nav: false,
                    dots: false,
                    autoplay: true,
                    smartSpeed: 500,
                    margin: 10
                });
            } else {
                imageContainer.innerHTML = `<img src="${imageUrlCover}" alt="Cover Photo" class="cover_image">`;
            }

            const container = document.getElementById("event-payment");
            container.innerHTML = "";
            eventData.data.paymentMethods.forEach(payment => {
                const eventElement = document.createElement("div");
                eventElement.classList.add("payment-card");
                let imageUrl;
                switch (payment) {
                    case "credit_card":
                        imageUrl = "./images/credit-card.svg";
                        break;
                    case "paypal":
                        imageUrl = "./images/paypal.svg";
                        break;
                    case "cash":
                        imageUrl = "./images/cash.svg";
                        break;
                }

                let paymentText;
                switch (payment) {
                    case "credit_card":
                        paymentText = "Credit Card";
                        break;
                    case "paypal":
                        paymentText = "Paypal";
                        break;
                    case "cash":
                        paymentText = "Cash";
                        break;
                }

                eventElement.innerHTML = `
                    <img 
                        src="${imageUrl}"
                        alt="${payment}"
                    />
                    <h3>${paymentText}</h3>
                `;

                // Append the generated HTML to the container
                container.appendChild(eventElement);
            });

            var mapProp = {
                center: new google.maps.LatLng(eventData.data.trainingLocation.coordinates[0], eventData.data.trainingLocation.coordinates[1]),
                zoom: 5,
                disableDefaultUI: true,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{ color: "#263c3f" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#6b9a76" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{ color: "#746855" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#1f2835" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#f3d19c" }],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{ color: "#2f3948" }],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#515c6d" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{ color: "#17263c" }],
                    },
                ],
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
            attendees.forEach(attendee => {
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

            // Handle Reviews
            const reviews = reviewsAttendeesResponse.data.reviews;
            const reviewsContainer = document.getElementById('reviews-carousel');
            reviewsContainer.innerHTML = '';
            reviews.forEach(review => {
                const reviewDate = formatRelativeTime(review.createdAt);
                const reviewCardHtml = `
                    <div class="item">
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

            $("#reviews-carousel").owlCarousel({
                items: 1.3,
                loop: false,
                nav: false,
                dots: false,
                margin: 10
            });

            // Remove 'hidden' class from elements
            document.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
        })
        .catch(error => {
            hideLoader();
            // console.error('Error fetching data:', error);
        });
});
