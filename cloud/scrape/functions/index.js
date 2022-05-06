require("events").EventEmitter.defaultMaxListeners = 10;
const functions = require("firebase-functions");

const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const url = require("url");

const app = express();
const port = 3000;
const allowedOrigins = [
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "http://localhost:8080",
  "http://localhost:8100",
  "https://goshare360.web.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
      return true;
    } else {
      callback(new Error("Origin not allowed by CORS"));
      return false;
    }
  },
};

app.options("*", cors(corsOptions));
app.use(cors());

app.get("/scraper", cors(corsOptions), (req, res) => {
  const index = req.param("siteId");
  const country = req.param("country");
  const state = req.param("state");
  const city = req.param("city").split(" ").join("%20");
  const placeId = req.param("placeId");
  const lat = req.param("lat");
  const lng = req.param("lng");
  const keyword = req.param("keyword").toLowerCase();
  let limit = req.param("limit");
  if (keyword !== "") {
    limit = 100;
  }

  const unSpaceCity = city.split("%20").join("");
  const underlineCity = city.split("%20").join("_");
  const minusCity = city.split("%20").join("-");
  const plusCity = city.split("%20").join("+");


  const weworkCities = [
    "Atlanta", "Austin", "Boston", "Boulder", "Charlotte", "Chicago", "College Park, MD", "Columbus",
    "Dallas - Fort Worth", "Denver", "Detroit", "Houston", "Kansas City", "Las Vegas", "Los Angeles", "Miami",
    "Minneapolis", "Nashville", "New York City", "Orange County", "Philadelphia", "Phoenix", "Portland", "Raleigh-Durham",
    "Sacramento", "Salt Lake City", "San Diego", "Seattle", "SF Bay Area", "St. Louis", "Tampa", "Washington, D.C",
    "Calgary", "Montreal", "Toronto", "Vancouver"];

  const taskrabbitCities = {
    "Los Angeles": "la-oc",
  };

  const longStateUSA = {
    "AK": "Alaska",
    "AL": "Alabama",
    "AR": "Arkansas",
    "AZ": "Arizona",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DC": "District of Columbia",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "IA": "Iowa",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "MA": "Massachusetts",
    "MD": "Maryland",
    "ME": "Maine",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MO": "Missouri",
    "MS": "Mississippi",
    "MT": "Montana",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "NE": "Nebraska",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NV": "Nevada",
    "NY": "New York",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VA": "Virginia",
    "VT": "Vermont",
    "WA": "Washington",
    "WI": "Wisconsin",
    "WV": "West Virginia",
    "WY": "Wyoming",
  };

  const longStateCanada = {
    "AB": "Alberta",
    "BC": "British Columbia",
    "MB": "Manitoba",
    "NB": "New Brunswick",
    "NL": "Newfoundland and Labrador",
    "NS": "Nova Scotia",
    "NT": "Northwest Territories",
    "NU": "Nunavut",
    "ON": "Ontario",
    "PE": "Prince Edward Island",
    "QC": "Quebec",
    "SK": "Saskatchewan",
    "YT": "Yukon",
  };

  const URLs = [
    {
      index: 0,
      elementURL: "https://www.airbnb.com/s/" + minusCity + "/experiences?refinement_paths%5B%5D=%2Fexperiences%2Fsection%2FPAGINATED_EXPERIENCES&tab_id=experience_tab",
      siteURL: "https://www.airbnb.com",
    }, {
      index: 1,
      elementURL: "https://www.viator.com/searchResults/all?text=" + city + "%2C%20" + state,
      siteURL: "https://www.viator.com",
    }, {
      index: 2,
      elementURL: "https://www.eatwith.com/search?q=" + plusCity + "%2C+" + state + "%2C+United+States",
      siteURL: "https://www.eatwith.com",
    }, {
      index: 3,
      elementURL: "https://mealshare.ca/en/find-a-restaurant/#/" + minusCity.toLowerCase(),
      siteURL: "https://mealshare.ca/en",
    }, {
      index: 4,
      elementURL: "https://www.airbnb.com/s/" + minusCity + "--" + state + "--" + (country === "USA" ? "United-States" : country) + "/homes",
      siteURL: "https://www.airbnb.com",
    }, {
      index: 5,
      elementURL: "https://www.wework.com/" + (weworkCities.includes(city.split("%20").join(" ")) ? ("search?slug=" + minusCity.toLowerCase() + "&capacity=1") : ""),
      siteURL: "https://www.wework.com",
    }, {
      index: 6,
      elementURL: "https://www.furnishedfinder.com/housing/" + minusCity + "/" + (longStateUSA[state] ? longStateUSA[state] : state),
      siteURL: "https://www.furnishedfinder.com",
    }, {
      index: 7,
      elementURL: "https://www.neighbor.com/search?search=" + city + "%2C%20" + state + "%2C%20" + country,
      siteURL: "https://www.neighbor.com",
    }, {
      index: 8,
      elementURL: "https://rentthebackyard.com/",
      siteURL: "https://rentthebackyard.com",
    }, {
      index: 9,
      elementURL: "https://www.justpark.com/search/?coords=" + lat + "%2C" + lng,
      referenceURL: "https://www.justpark.com/search/?q=" + city + "%2C%20" + state + "%2C%20USA&source=autocomplete",
      siteURL: "https://www.justpark.com",
    }, {
      index: 10,
      elementURL: "https://zeusliving.com/homes?placeid=" + placeId,
      siteURL: "https://zeusliving.com",
    }, {
      index: 11,
      elementURL: "https://www.justcoglobal.com/",
      siteURL: "https://www.justcoglobal.com",
    }, {
      index: 12,
      elementURL: "https://www.couchsurfing.com/place?utf8=%E2%9C%93&search_type=place&latitude=" + lat + "&longitude=" + lng,
      siteURL: "https://www.couchsurfing.com/",
    }, {
      index: 13,
      elementURL: "https://campspace.com/en/campsites/map?search%5Blocation%5D=" + city + "%2C%20" + state + "%2C%20" + country + "&search%5BplaceId%5D=" + placeId,
      siteURL: "https://campspace.com",
    }, {
      index: 14,
      elementURL: "https://www.sonder.com/destinations/" + underlineCity.toLowerCase() + "/search",
      siteURL: "https://www.sonder.com",
    }, {
      index: 15,
      elementURL: "https://www.afar.com/travel-guides/" + (country === "USA" ? ("united-states/" + (longStateUSA[state] ? longStateUSA[state].split(" ").join("").toLowerCase() : state.toLowerCase()) + "/" + minusCity.toLowerCase() + "/guide") : (country.toLowerCase() + "/") + minusCity.toLowerCase() + "/guide"),
      siteURL: "https://www.afar.com",
    }, {
      index: 16,
      elementURL: "https://www.lonelyplanet.com/usa/" + minusCity.toLowerCase(),
      siteURL: "https://www.lonelyplanet.com/",
    }, {
      index: 17,
      elementURL: "https://www.lyric.com/70-pine",
      siteURL: "https://www.lyric.com",
    }, {
      index: 18,
      elementURL: "https://" + unSpaceCity.toLowerCase() + ".craigslist.org/d/housing/search/hhh",
      siteURL: "https://www.craigslist.org",
    }, {
      index: 19,
      elementURL: "https://poshmark.com/brand/" + city,
      siteURL: "https://poshmark.com",
    }, {
      index: 20,
      elementURL: "https://turo.com/us/en/search?country=US&location=" + city + "&locationType=City&region=" + state,
      siteURL: "https://turo.com",
    }, {
      index: 21,
      elementURL: "https://www.spinlister.com/search?q=" + state + "+" + unSpaceCity.toLowerCase(),
      referenceURL: "https://www.spinlister.com/search/s/" + (longStateUSA[state] ? longStateUSA[state].split(" ").join("").toLowerCase() : state.toLowerCase()) + "/c/" + minusCity.toLowerCase(),
      siteURL: "https:/www.spinlister.com",
    }, {
      index: 22,
      elementURL: "https://postmates.com/delivery/" + minusCity.toLowerCase(),
      siteURL: "https://postmates.com",
    }, {
      index: 23,
      elementURL: "https://www.taskrabbit.com/locations/" + (taskrabbitCities[city.split("%20").join(" ")] ? taskrabbitCities[city.split("%20").join(" ")] : minusCity.toLowerCase()),
      siteURL1: "https://www.taskrabbit.com",
      siteURL2: "https://www.taskrabbit.ca",
    }, {
      index: 24,
      // eslint-disable-next-line no-prototype-builtins
      elementURL: "https://www.guru.com/d/freelancers/c/programming-development/lc/" + (country === "USA" ? ("united-states/" + (longStateUSA.hasOwnProperty(state) ? longStateUSA[state].toLowerCase() : state) + "/" + minusCity.toLowerCase()) : (country.toLowerCase() + "/" + (longStateCanada.hasOwnProperty(state) ? longStateCanada[state].toLowerCase() : state) + "/" + minusCity.toLowerCase())),
      siteURL: "https://www.guru.com",
    }, {
      index: 25,
      elementURL: "https://www.handy.com/services/home-cleaning/" + minusCity.toLowerCase(),
      siteURL: "https://shop.handy.com",
    }, {
      index: 26,
      elementURL: "https://www.silvernest.com/room-for-rent?utf8=%E2%9C%93&s%5Blayout%5D=narrow&place=" + plusCity + "%2C+" + state + "%2C+" + country,
      siteURL: "https://www.silvernest.com",
    }, {
      index: 27,
      elementURL: (country === "USA" ? "https://www.instacart.com" : "https://www.instacart.ca") + "/grocery-delivery/" + state.toLowerCase() + "/near-me-in-" + minusCity.toLowerCase() + "-" + state.toLowerCase(),
      siteURL: "https://www.instacart.com",
    }, {
      index: 28,
      elementURL: "https://www.appjobs.com/" + minusCity.toLowerCase(),
      siteURL: "https://www.appjobs.com",
    }, {
      index: 29,
      elementURL: "https://www.skillshare.com/browse?via=header",
      siteURL: "https://www.skillshare.com",
    }, {
      index: 30,
      elementURL: "https://www.rover.com/search/?pet_type=dog&location=" + plusCity + "%2C+" + state + "%2C+USA",
      referenceURL: (country === "Canada" ? "https://www.rover.com/ca/" : "https://www.rover.com/") + minusCity.toLowerCase() + "--" + state.toLowerCase() + "--dog-boarding/",
      siteURL: "https://www.rover.com",
    }, {
      index: 31,
      elementURL: "https://www.zipcar.com/" + minusCity.toLowerCase(),
      siteURL: "https://www.zipcar.com",
    }, {
      index: 32,
      elementURL: "https://caregiverjobsnow.com/jobs?&location=" + plusCity,
      siteURL: "https://caregiverjobsnow.com",
    }, {
      index: 33,
      elementURL: "https://www.outdoorsy.com/rv-search?address=" + city + "%2C%20" + state + "%2C%20" + country,
      siteURL: "https://www.outdoorsy.com/",
    }, {
      index: 34,
      elementURL: "https://rvshare.com/rv-rental?location=" + city + "%2C%20" + state + "%2C%20" + country,
      siteURL: "https://rvshare.com",
    }, {
      index: 35,
      elementURL: "https://www.borrowaboat.com/search?location=" + underlineCity.toLowerCase(),
      siteURL: "https://www.borrowaboat.com",
    }, {
      index: 36,
      elementURL: "https://www.sharedadventures.org/participate/become-a-sponsor/",
      siteURL: "https://www.sharedadventures.org",
    }, {
      index: 37,
      elementURL: "https://www.kickstarter.com/discover/categories/crafts",
      siteURL: "https://www.kickstarter.com",
    }, {
      index: 38,
      elementURL: "https://www.indiegogo.com/campaign_collections/health-fitness",
      siteURL: "https://www.indiegogo.com",
    }, {
      index: 39,
      elementURL: "https://wefunder.com/explore/main_street",
      siteURL: "https://wefunder.com",
    }, {
      index: 40,
      elementURL: "https://localstake.com/success_stories",
      siteURL: "https://localstake.com",
    }, {
      index: 41,
      elementURL: "https://www.seedinvest.com/offerings",
      siteURL: "https://www.seedinvest.com",
    }, {
      index: 42,
      elementURL: "https://www.fundable.com/browse/featured",
      siteURL: "https://www.fundable.com",
    }, {
      index: 43,
      elementURL: "https://www.equitynet.com/browse-companies/popular/",
      siteURL: "https://www.equitynet.com",
    }, {
      index: 44,
      elementURL: "https://www.kickstarter.com/discover/places/" + minusCity.toLowerCase() + "-" + state.toLowerCase(),
      siteURL: "https://www.kickstarter.com",
    }, {
      index: 45,
      elementURL: "https://www.coursera.org/browse",
      siteURL: "https://www.coursera.org",
    }, {
      index: 46,
      elementURL: "https://www.contexttravel.com/cities/" + minusCity.toLowerCase(),
      siteURL: "https://www.contexttravel.com",
    }, {
      index: 47,
      elementURL: "https://www.sharegrid.com/" + (minusCity === "Los-Angeles" ? unSpaceCity.toLowerCase() : minusCity.toLowerCase()),
      siteURL: "https://www.sharegrid.com",
    }, {
      index: 48,
      elementURL: "https://www.hipcamp.com/discover/search?lat=" + lat + "&lng=" + lng,
      siteURL: "https://www.hipcamp.com",
    }, {
      index: 49,
      // eslint-disable-next-line no-prototype-builtins
      elementURL: "https://www.rvezy.com/rv-search?SearchAddress=" + plusCity + "%2C+" + (longStateUSA.hasOwnProperty(state) ? longStateUSA[state].toLowerCase() : state) + "%2C+United+States&SearchLat=" + lat + "&SearchLng=" + lng,
      siteURL: "https://www.rvezy.com",
    },
  ];

  puppeteer
      .launch({headless: true, args: ["--no-sandbox"]})
      .then((browser) => browser.newPage())
      .then((page) => {
        page.setDefaultNavigationTimeout(0);
        const options = parseInt(index) === 7 ? "networkidle2" : "networkidle0";
        return page.goto(URLs[index].elementURL, {waitUntil: options}).then(() => {
          return page.content();
        });
      })
      .then((html) => {
        if (parseInt(index) === 6) {
          console.log(html);
        }
        const $ = cheerio.load(html);

        let name = "";
        let logo = "";
        const itemTitles = [];
        const itemLinks = [];
        const itemImages = [];
        const itemPrices = [];
        const itemDescriptions = [];

        const elements = [
          {
            index: 0,
            tag: "._1355n57e span._16qwvbuk",
            link: "._1355n57e a._1jhvjuo",
            image: "._1355n57e img._91slf2a",
            price: "._1355n57e ._1gartvrn ._1p7iugi",
          }, {
            index: 1,
            tag: "div[data-test-selector='product-item'] .product-card-row-title a.card-link",
            link: "div[data-test-selector='product-item'] .product-card-row-title a.card-link",
            image: "div[data-test-selector='product-item'] .product-image-container img",
            price: "div[data-test-selector='product-item'] .price-font",
            description: "div[data-test-selector='product-item'] .summary-text",
          }, {
            index: 2,
            tag: "div.SimpleCard-u7fe2k-0 a[href*='https://www.eatwith.com/events']:nth-of-type(2) span.Text__StyledText-sc-8uykko-0",
            link: "div.SimpleCard-u7fe2k-0 a[href*='https://www.eatwith.com/events']:first-child",
            image: "div.SimpleCard-u7fe2k-0 > a:first-child div.BackgroundImage__Div-sc-1kdzvq-0",
            price: "div.SimpleCard-u7fe2k-0 > a:first-child div.Box-sc-22zsge-0",
          }, {
            index: 3,
            tag: ".restaurant .info h4 span",
            link: ".restaurant .info p.desktop-only a",
            image: ".restaurant div.desktop-only img",
          }, {
            index: 4,
            tag: "._8ssblpx span._1whrsux9",
            link: "._8ssblpx a._mm360j",
            image: "._8ssblpx picture img",
            price: "._8ssblpx div._1gi6jw3f",
            description: "._8ssblpx div._1olmjjs6",
          }, {
            index: 5,
            tag: ".search-results .search-card .building-content .building-heading",
            link: ".search-results .search-card",
            image: ".search-results .search-card .search-card__image > img",
          }, {
            index: 6,
            tag: ".table_container .title_container .title",
            link: ".table_container .title_container > a",
            image: ".table_container .img_container .propImg",
            price: ".table_container .multiple_details1 .prop_price",
          }, {
            index: 7,
            tag: ".listing-cell a.card-body-container .card-body-tag-type",
            link: ".listing-cell a.card-body-container",
            image: ".listing-cell div.card-header img",
            price: ".listing-cell .card-body-container .card-body-price-and-size > div",
          }, {
            index: 8,
            tag: "div.summary-item .summary-title-link",
            link: "div.summary-item .summary-title-link",
            image: "div.summary-item .summary-thumbnail img",
          }, {
            index: 9,
            tag: "li.c-search-result .c-location-address",
            link: "li.c-search-result .c-location-address",
            image: "li.c-search-result .c-search-result__image-container img",
            price: "li.c-search-result .c-search-result__price .c-price--inline",
            description: "li.c-search-result .c-distance--walking",
          }, {
            index: 10,
            tag: "div.pos-r h3._1A44f",
            link: "div.pos-r a[data-test='listing-link']",
            image: "div.pos-r img._1Z7H0",
            price: "div.pos-r div[data-test='price-display']",
            description: "div.pos-r div._14cUQ",
          }, {
            index: 11,
          }, {
            index: 12,
            tag: ".person-avatar > a.text",
            link: ".person-avatar > a.text",
            image: ".person-avatar .image-wrapper .image img",
          }, {
            index: 13,
            tag: ".space-item-inbound .space-item-content h3",
            link: ".space-item-inbound a",
            image: ".space-item-inbound a img",
            price: ".space-item-inbound .space-item-content .space-item-meta .space-item-price",
          }, {
            index: 14,
            tag: ".Column-module__column___R-LzP div[data-testid='SearchResultCard-card_container'] div[data-testid='SearchResultCard-title'] h2",
            link: ".Column-module__column___R-LzP div[data-testid='SearchResultCard-card_container'] .Link-module__base___1ypHw",
            image: ".Column-module__column___R-LzP div[data-testid='SearchResultCard-card_container'] .Image-module__image___357yU",
            price: ".Column-module__column___R-LzP div[data-testid='SearchResultCard-card_container'] div[data-testid='SearchResultCard-price'] p:nth-of-type(2)",
            description: ".Column-module__column___R-LzP div[data-testid='SearchResultCard-card_container'] .SearchResultCard-module__stats___1sn4g",
          }, {
            index: 15,
            tag: "._2meVlLgG6OvjzKCCl-Q2fm ._1AkF3vJdwXw-lDZPnRuiEu a h3",
            link: "._2meVlLgG6OvjzKCCl-Q2fm ._1AkF3vJdwXw-lDZPnRuiEu a",
            image: "._2meVlLgG6OvjzKCCl-Q2fm ._1gZ5uykNxIKtdgx6f9qRf img._2aqevVdWKPtY6MVdAiz3Gl",
            description: "._2meVlLgG6OvjzKCCl-Q2fm p._3pBdhfVuPnzwyj0dwDJwPd",
          }, {
            index: 16,
            tag: ".slider-slide .card-description .title",
            link: ".slider-slide .card-description .bookingText a",
            image: ".slider-slide .bg-cover",
            price: ".slider-slide .card-description .bookingText p span:nth-of-type(2)",
          }, {
            index: 17,
            tag: ".w-dyn-item .building-suite-info-container h3",
            link: ".w-dyn-item .building-suite-info-container a",
            image: ".w-dyn-item .building-suite-photo-wrapper .w-slider-mask > div:nth-of-type(1)",
          }, {
            index: 18,
            tag: "li.result-row .result-info .result-title",
            link: "li.result-row .result-info .result-title",
            image: "li.result-row .result-image div[data-index='0'] img",
            price: "li.result-row .result-meta .result-price",
          }, {
            index: 19,
            tag: ".tile .card .item__details .tile__title",
            link: ".tile .card .item__details .tile__title",
            image: ".tile .card .tile__covershot .img__container img",
            price: ".tile .card .item__details > div:nth-of-type(2) > div > span:nth-of-type(1)",
          }, {
            index: 20,
            tag: ".searchResult-gridItem .css-1wmlurb-StyledText-VehicleLabelText",
            link: ".searchResult-gridItem a.css-1mzihef-VehicleCardLinkBox-VehicleCardLinkBox",
            image: ".searchResult-gridItem img.css-u88s0l-StyledImage-CardImage",
            price: ".searchResult-gridItem .css-g36krj-StyledText",
          }, {
            index: 21,
            tag: "div.card a.ride div.ride-caption > span.h3",
            link: "div.card a.ride",
            image: "div.card a.ride img.img-responsive",
            price: "div.card a.ride div.ride-list > span:nth-of-type(1)",
            description: "div.card a.ride div.ride-list > span:last-child",
          }, {
            index: 22,
            tag: ".css-b7gm3f a[href*='/merchant/'] .css-1rr4qq7",
            link: ".css-b7gm3f a[href*='/merchant/']",
            image: ".css-b7gm3f a[href*='/merchant/'] .css-1hyfx7x",
            price: ".css-b7gm3f a[href*='/merchant/'] .css-1ms37uw",
            description: ".css-b7gm3f a[href*='/merchant/'] .css-1hj0fq7",
          }, {
            index: 23,
            tag: "div.mktg-template-item div.media--content a.mktg-template-item--title-link",
            link: "div.mktg-template-item div.media--content a.mktg-template-item--title-link",
            image: "div.mktg-template-item img.mktg-template-item--img",
            description: "div.mktg-template-item p.mktg-template-item--subtitle",
          }, {
            index: 24,
            tag: ".record__details .record__header .avatarinfo .freelancerAvatar__screenName a",
            link: ".record__details .record__header .avatarinfo .freelancerAvatar__screenName a",
            image: ".record__details .record__header .avatar a img",
            price: ".record__details .record__header .avatarinfo .freelancerAvatar__meta .earnings",
            description: ".record__details .record__content .serviceListing__details",
          }, {
            index: 25,
            tag: "div.cards div.cards__header p.name",
            image: "div.cards div.cards__header div.photo img",
            description: "div.cards div.cards__body",
          }, {
            index: 26,
            tag: "div.rental-tile div.card-body div.title",
            link: "div.rental-tile div.card-body > a",
            image: "div.rental-tile div.card-image img.listing-image",
            price: "div.rental-tile div.card-body div.price",
            description: "div.rental-tile div.card-body div.description",
          }, {
            index: 27,
            tag: "li[data-radium='true'] .rmq-5ff715cf",
            link: "li[data-radium='true'] .rmq-5ff715cf a",
            image: "li[data-radium='true'] .rmq-5ff715cf a img",
          }, {
            index: 28,
            tag: ".jobOfferTile .jobOfferTile__title",
            link: ".jobOfferTile .jobOfferTile__content > a",
            image: ".jobOfferTile .jobOfferTile__info img.image",
            price: ".jobOfferTile .jobOfferTile__earnings > span",
            description: ".jobOfferTile span.description",
          }, {
            index: 29,
            tag: "ul.classes-list-grid .ss-card .ss-card__title > a",
            link: "ul.classes-list-grid .ss-card .ss-card__title > a",
            image: "ul.classes-list-grid .ss-card .thumbnail-img",
          }, {
            index: 30,
            tag: ".SearchResultCard__SearchResultCardWrapper-sc-69cmvm-1 .NameRow__NameLink-w16h4v-2",
            link: ".SearchResultCard__SearchResultCardWrapper-sc-69cmvm-1 .NameRow__NameLink-w16h4v-2",
            image: ".SearchResultCard__SearchResultCardWrapper-sc-69cmvm-1 .ImageColumn__DesktopImage-dvxrpx-2",
            price: ".SearchResultCard__SearchResultCardWrapper-sc-69cmvm-1 .PriceAndFavoriteColumn__Price-qrhb9n-3",
            description: ".SearchResultCard__SearchResultCardWrapper-sc-69cmvm-1 .InfoColumn__Title-sc-9o301b-1",
          }, {
            index: 31,
            tag: ".slick-list li.slick-slide h4",
            link: ".slick-list li.slick-slide h4",
            image: ".slick-list li.slick-slide img",
            price: ".slick-list li.slick-slide p",
          }, {
            index: 32,
            tag: ".job-card a.title",
            link: ".job-card a.title",
            image: ".job-card img.logo",
            description: ".job-card .row > div:nth-of-type(2) > div:nth-of-type(2)",
          }, {
            index: 33,
            tag: ".ListingTile_tile__4mi66  .ListingTile_title__Pa_Wp",
            link: ".ListingTile_tile__4mi66",
            image: ".ListingTile_tile__4mi66 div.slick-active img",
            price: ".ListingTile_tile__4mi66 .PriceCurrent_container__3sxpf",
            description: ".ListingTile_tile__4mi66 .ListingTile_info__1gH8g",
          }, {
            index: 34,
            tag: "div[data-id='rv-card'] a[href*='/rvs/details/'] .RVCardstyles__ThumbnailHeadlineOverlay-sc-1bwuzqm-3 h4",
            link: "div[data-id='rv-card'] a[href*='/rvs/details']",
            image: "div[data-id='rv-card'] li:nth-of-type(2) > img",
            price: "div[data-id='rv-card'] .RVCardstyles__RateText-sc-1bwuzqm-11",
            description: "div[data-id='rv-card'] .RVCardstyles__MetaText-sc-1bwuzqm-9 > span:nth-of-type(2)",
          }, {
            index: 35,
            tag: ".searchResultsPage_boatCardLink__3CFNW > .searchResultsPage_boatCard__2mDeP > div:nth-of-type(2) > p:nth-of-type(1)",
            link: ".searchResultsPage_boatCardLink__3CFNW",
            image: ".searchResultsPage_boatCardLink__3CFNW > .searchResultsPage_boatCard__2mDeP > div:nth-of-type(1) > img",
            price: ".searchResultsPage_boatCardLink__3CFNW > .searchResultsPage_boatCard__2mDeP > div:nth-of-type(1) > div",
          }, {
            index: 36,
            tag: ".donate-infobox .uabb-infobox-title-wrap",
            link: ".donate-infobox .uabb-infobox-title-wrap",
            image: ".donate-infobox .uabb-image-content img",
            price: ".donate-infobox .uabb-creative-button-text",
            description: ".donate-infobox .uabb-infobox-text p",
          }, {
            index: 37,
            tag: ".js-track-project-card .soft-black > h3",
            link: ".js-track-project-card .img-placeholder",
            image: ".js-track-project-card .img-placeholder > img",
            price: ".js-track-project-card span[data-test-id='amount-pledged']",
          }, {
            index: 38,
            tag: ".discoverableCard .discoverableCard-body .discoverableCard-title",
            link: ".discoverableCard > a[href*='/projects']",
            image: ".discoverableCard .discoverableCard-image",
            price: ".discoverableCard .discoverableCard-body .discoverableCard-balance",
            description: ".discoverableCard .discoverableCard-body .discoverableCard-description",
          }, {
            index: 39,
            tag: ".company-url-bn .card_info .tagline",
            link: ".company-url-bn",
            image: ".company-url-bn .photo",
            description: ".company-url-bn .desc",
          }, {
            index: 40,
            tag: ".tombstone .name strong",
            link: ".tombstone .profile_button a[href*='/businesses']",
            image: ".tombstone .logo .grid_image",
            price: ".tombstone .vital_amount",
            description: ".tombstone .tagline",
          }, {
            index: 41,
            tag: ".thumbnail .thumbnail-title",
            link: ".thumbnail .thumbnail-hero-image-wrapper",
            image: ".thumbnail .thumbnail-hero-image",
            price: ".thumbnail .extra-tight-list li:nth-of-type(1)",
            description: ".thumbnail .tagline",
          }, {
            index: 42,
            tag: ".company-tile .company .name",
            link: ".company-tile > a[href*='https://www.fundable.com/']",
            image: ".company-tile .photo",
            description: ".company-tile .elevator-pitch",
          }, {
            index: 43,
            tag: ".teaser-container .teaser-content .teaser-name",
            link: ".teaser-container > a[href*='/c']",
            image: ".teaser-container .teaser-logo img",
            price: ".teaser-container .teaser-funding .goal .text",
            description: ".teaser-container .teaser-content .teaser-description",
          }, {
            index: 44,
            tag: "div[data-section='discovery_location'] a.soft-black h3",
            link: "div[data-section='discovery_location'] a.img-placeholder",
            image: "div[data-section='discovery_location'] a.img-placeholder img",
            price: "div[data-section='discovery_location'] span[data-test-id='amount-pledged']",
          }, {
            index: 45,
            tag: "div.slick-slide a.collection-product-card div._1meetf18",
            link: "div.slick-slide a.collection-product-card",
            image: "div.slick-slide a.collection-product-card div._jm1ow5",
            price: "div.slick-slide a.collection-product-card span._1bx62xb",
          }, {
            index: 46,
            tag: "div.tour-card h3.text--headline",
            link: "div.tour-card a.tour-card__link",
            image: "div.tour-card div.tour-card__information > img",
            price: "div.tour-card div.tour-detail__text",
            description: "div.tour-card p.tour-card__subtext",
          }, {
            index: 47,
            tag: "div.ftgEbl div.ipPXAS",
            link: "div.ftgEbl > a",
            image: "div.ftgEbl div.ippNlX > img",
            price: "div.ftgEbl div.cnukKw",
          }, {
            index: 48,
            tag: "div.Boexw a.oXTck span.kUqLIr",
            link: "div.Boexw a.oXTck",
            image: "div.Boexw a.oXTck ul li.selected img",
            price: "div.Boexw a.oXTck div.kSOyNu",
          }, {
            index: 49,
            tag: "div.card span.rv-name",
            link: "div.card a[href*='rv-rental']",
            image: "div.card div.swiper-slide-active img",
            price: "div.card span.nightly-price",
            description: "div.card span.sleeps",
          },
        ];


        if (parseInt(index) === 0) {
          name = "AirBnB";
          logo = "/assets/scrape/airbnb.png";
        } else if (parseInt(index) === 1) {
          name = "Viator";
          logo = "/assets/scrape/viator.png";
        } else if (parseInt(index) === 2) {
          name = "Eatwith";
          logo = "/assets/scrape/eatwith.png";
        } else if (parseInt(index) === 3) {
          name = "MealShare";
          logo = "/assets/scrape/mealshare.png";
        } else if (parseInt(index) === 4) {
          name = "AirBnB";
          logo = "/assets/scrape/airbnb.png";
        } else if (parseInt(index) === 5) {
          name = "Wework";
          logo = "/assets/scrape/wework.png";
        } else if (parseInt(index) === 6) {
          name = "FurnishedFinder";
          logo = "/assets/scrape/furnishedfinder.png";
        } else if (parseInt(index) === 7) {
          name = "Neighbor";
          logo = "/assets/scrape/neighbor.png";
        } else if (parseInt(index) === 8) {
          name = "Rent the backyard";
          logo = "/assets/scrape/rentthebackyard.png";
        } else if (parseInt(index) === 9) {
          name = "JustPark";
          logo = "/assets/scrape/justpark.png";
        } else if (parseInt(index) === 10) {
          name = "Zeus Living";
          logo = "/assets/scrape/zeusliving.png";
        } else if (parseInt(index) === 12) {
          name = "Couchsurfing";
          logo = "/assets/scrape/couchsurfing.png";
        } else if (parseInt(index) === 13) {
          name = "Campspace";
          logo = "/assets/scrape/campspace.png";
        } else if (parseInt(index) === 14) {
          name = "Sonder";
          logo = "/assets/scrape/sonder.png";
        } else if (parseInt(index) === 15) {
          name = "Afar";
          logo = "/assets/scrape/afar.png";
        } else if (parseInt(index) === 16) {
          name = "Lonely Planet";
          logo = "/assets/scrape/lonelyplanet.png";
        } else if (parseInt(index) === 17) {
          name = "Lyric";
          logo = "/assets/scrape/lyric.png";
        } else if (parseInt(index) === 18) {
          name = "Craigslist";
          logo = "/assets/scrape/craigslist.png";
        } else if (parseInt(index) === 19) {
          name = "Poshmark";
          logo = "/assets/scrape/poshmark.png";
        } else if (parseInt(index) === 20) {
          name = "Turo";
          logo = "/assets/scrape/turo.png";
        } else if (parseInt(index) === 21) {
          name = "Spinlister";
          logo = "/assets/scrape/spinlister.png";
        } else if (parseInt(index) === 22) {
          name = "Postmates";
          logo = "/assets/scrape/postmates.png";
        } else if (parseInt(index) === 23) {
          name = "TaskRabbit";
          logo = "/assets/scrape/taskrabbit.png";
        } else if (parseInt(index) === 24) {
          name = "Guru";
          logo = "/assets/scrape/guru.png";
        } else if (parseInt(index) === 25) {
          name = "Handy";
          logo = "/assets/scrape/handy.png";
        } else if (parseInt(index) === 26) {
          name = "Silvernest";
          logo = "/assets/scrape/silvernest.png";
        } else if (parseInt(index) === 27) {
          name = "Instacart";
          logo = "/assets/scrape/instacart.png";
        } else if (parseInt(index) === 28) {
          name = "AppJobs";
          logo = "/assets/scrape/appjobs.png";
        } else if (parseInt(index) === 29) {
          name = "SkillShare";
          logo = "/assets/scrape/skillshare.png";
        } else if (parseInt(index) === 30) {
          name = "Rover";
          logo = "/assets/scrape/rover.png";
        } else if (parseInt(index) === 31) {
          name = "Zipcar";
          logo = "/assets/scrape/zipcar.png";
        } else if (parseInt(index) === 32) {
          name = "CaregiverJobsNow";
          logo = "/assets/scrape/caregiverjobsnow.png";
        } else if (parseInt(index) === 33) {
          name = "Outdoorsy";
          logo = "/assets/scrape/outdoorsy.png";
        } else if (parseInt(index) === 34) {
          name = "RVShare";
          logo = "/assets/scrape/rvshare.png";
        } else if (parseInt(index) === 35) {
          name = "BorrowABoat";
          logo = URLs[index].siteURL + $(".logo_logo__3T_na").attr("src");
        } else if (parseInt(index) === 36) {
          name = "SharedAdventures";
          logo = $("img.fl-photo-img").attr("src");
        } else if (parseInt(index) === 37) {
          name = "KickStarter";
          logo = $(".section_global_nav_logo a").html();
        } else if (parseInt(index) === 38) {
          name = "Indiegogo";
          logo = "";
        } else if (parseInt(index) === 39) {
          name = "Wefunder";
          logo = "https://d2qbf73089ujv4.cloudfront.net/uploads/remote_files/12766-djZIdwNohMSE92vbIfz5DNOX/wefunder_text_logo_v5.png";
        } else if (parseInt(index) === 40) {
          name = "Localstake";
          logo = $(".logo a img").attr("src");
        } else if (parseInt(index) === 41) {
          name = "Seedinvest";
          logo = $("img.site-logo-dark").attr("src");
        } else if (parseInt(index) === 42) {
          name = "Fundable";
          logo = $(".Branding__fundable__15_C2").html();
        } else if (parseInt(index) === 43) {
          name = "EquityNet";
          logo = URLs[index].siteURL + $(".enlogo img").attr("src");
        } else if (parseInt(index) === 44) {
          name = "KickStarter";
          logo = "/assets/scrape/kickstarter.png";
        } else if (parseInt(index) === 45) {
          name = "Coursera";
          logo = "/assets/scrape/coursera.png";
        } else if (parseInt(index) === 46) {
          name = "Context";
          logo = "/assets/scrape/context.png";
        } else if (parseInt(index) === 47) {
          name = "ShareGrid";
          logo = "/assets/scrape/sharegrid.png";
        } else if (parseInt(index) === 48) {
          name = "Hipcamp";
          logo = "/assets/scrape/hitcamp.png";
        } else if (parseInt(index) === 49) {
          name = "RVezy";
          logo = "/assets/scrape/rvezy.png";
        }


        $(elements[index].tag).each(function() {
          if (parseInt(index) === 21) {
            if ($(this).html() !== "") {
              itemTitles.push({title: $(this).html()});
            }
          } else {
            itemTitles.push({title: $(this).text().split("\n        ").join("")});
          }
        });


        const hrefLinks = [2, 3, 6, 13, 17, 18, 29, 30, 37, 42, 44];
        const elementUrlLinks = [8, 9, 25, 31, 36];
        $(elements[index].link).each(function() {
          if (hrefLinks.includes(parseInt(index))) {
            itemLinks.push($(this).attr("href"));
          } else if (elementUrlLinks.includes(parseInt(index))) {
            itemLinks.push(URLs[index].elementURL);
          } else if (parseInt(index) === 21) {
            if ($(this).attr("href") !== "#") {
              itemLinks.push($(this).attr("href"));
            }
          } else if (parseInt(index) === 23) {
            if (country === "USA") {
              itemLinks.push(URLs[index].siteURL1 + $(this).attr("href"));
            } else if (country === "Canada") {
              itemLinks.push(URLs[index].siteURL2 + $(this).attr("href"));
            }
          } else {
            const _URL = URLs[index].siteURL + $(this).attr("href");
            if (itemLinks.indexOf(_URL) === -1) {
              itemLinks.push(_URL);
            }
          }
        });


        let j = 0;
        const srcImages = [0, 1, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 20, 22, 24, 26, 27, 29, 30, 31, 32, 33, 35, 36, 44, 47, 48];
        const dataSrcImages = [5, 19, 23, 25, 28, 46];
        const backgroundImages = [16, 17, 38, 39, 40, 42, 45];
        $(elements[index].image).each(function() {
          if (srcImages.includes(parseInt(index))) {
            itemImages.push($(this).attr("src"));
          } else if (parseInt(index) === 2) {
            const background = $(this).attr("style").split("background-image: ").join("");
            itemImages.push(background.substring(5, background.length - 3));
          } else if (dataSrcImages.includes(parseInt(index))) {
            const imageSrc = $(this).attr("data-src");
            itemImages.push(imageSrc);
          } else if (backgroundImages.includes(parseInt(index))) {
          // eslint-disable-next-line no-useless-escape
            const imageSrc = $(this).css("background-image").replace("url(", "").replace(")", "").replace(/\"/gi, "");
            itemImages.push(imageSrc);
          } else if (parseInt(index) === 15) {
            itemImages.push($(this).attr("data-src").split("1x,")[0]);
          } else if (parseInt(index) === 21) {
            if (j >= 1) {
              itemImages.push(url.resolve(URLs[index].elementURL, $(this).attr("src")));
            }
            j++;
          } else if (parseInt(index) === 34) {
            const imageSrc = $(this).attr("srcset");
            itemImages.push(imageSrc.substr(0, imageSrc.length - 3));
          } else {
            itemImages.push(url.resolve(URLs[index].elementURL, $(this).attr("src")));
          }
        });


        $(elements[index].price).each(function() {
          if (parseInt(index) === 0) {
            const priceString = $(this).text();
            const lastIndex = priceString.lastIndexOf("$");
            const price = priceString.substring(lastIndex) + "/person";
            itemPrices.push(price);
          } else if (parseInt(index) === 35) {
            itemPrices.push($(this).html());
          } else {
            itemPrices.push($(this).text().split("\n        ").join(""));
          }
        });


        $(elements[index].description).each(function() {
          itemDescriptions.push($(this).text().split("\n        ").join(""));
        });


        itemTitles.forEach((site, index) => {
          site.name = name;
          site.logo = logo;
          site.url = itemLinks[index];
          if (itemImages !== []) {
            site.image = itemImages[index];
          }
          site.price = itemPrices[index];
          site.description = itemDescriptions[index];
        });

        const keywords = keyword.trim().split(" ");
        let finalResult = [];

        if (keywords.length > 2) {
          const keyword1 = keywords[0];
          const keyword2 = keywords[1];
          const keyword3 = keywords[2];
          const firstFilter = itemTitles.filter((item) => (item.title.toLowerCase().includes(keyword1) && item.title.toLowerCase().includes(keyword2) && item.title.toLowerCase().includes(keyword3)) ||
          ((item.description && item.description.toLowerCase().includes(keyword1)) && (item.description && item.description.toLowerCase().includes(keyword2)) && (item.description && item.description.toLowerCase().includes(keyword3))));
          const filteredArray1 = itemTitles.filter(function(el) {
            return firstFilter.indexOf(el) < 0;
          });
          const secondFilter = filteredArray1.filter((item) => (item.title.toLowerCase().includes(keyword1) && item.title.toLowerCase().includes(keyword2)) ||
          ((item.description && item.description.toLowerCase().includes(keyword1)) && (item.description && item.description.toLowerCase().includes(keyword2))));
          const filteredArray2 = filteredArray1.filter(function(el) {
            return secondFilter.indexOf(el) < 0;
          });
          const thirdFilter = filteredArray2.filter((item) => (item.title.toLowerCase().includes(keyword1) && item.title.toLowerCase().includes(keyword3)) ||
          ((item.description && item.description.toLowerCase().includes(keyword1)) && (item.description && item.description.toLowerCase().includes(keyword3))));
          const filteredArray3 = filteredArray2.filter(function(el) {
            return thirdFilter.indexOf(el) < 0;
          });
          const fourthFilter = filteredArray3.filter((item) => (item.title.toLowerCase().includes(keyword2) && item.title.toLowerCase().includes(keyword3)) ||
          ((item.description && item.description.toLowerCase().includes(keyword2)) && (item.description && item.description.toLowerCase().includes(keyword3))));
          const filteredArray4 = filteredArray3.filter(function(el) {
            return fourthFilter.indexOf(el) < 0;
          });
          const fifthFilter = filteredArray4.filter((item) => item.title.toLowerCase().includes(keyword1) || (item.description && item.description.toLowerCase().includes(keyword1)));
          const filteredArray5 = filteredArray4.filter(function(el) {
            return fifthFilter.indexOf(el) < 0;
          });
          const sixthFilter = filteredArray5.filter((item) => item.title.toLowerCase().includes(keyword2) || (item.description && item.description.toLowerCase().includes(keyword2)));
          const filteredArray6 = filteredArray5.filter(function(el) {
            return sixthFilter.indexOf(el) < 0;
          });
          const seventhFilter = filteredArray6.filter((item) => item.title.toLowerCase().includes(keyword3) || (item.description && item.description.toLowerCase().includes(keyword3)));
          finalResult = finalResult.concat(firstFilter, secondFilter, thirdFilter, fourthFilter, fifthFilter, sixthFilter, seventhFilter);
        } else if (keywords.length === 2) {
          const keyword1 = keywords[0];
          const keyword2 = keywords[1];
          const firstFilter = itemTitles.filter((item) => (item.title.toLowerCase().includes(keyword1) && item.title.toLowerCase().includes(keyword2)) ||
          ((item.description && item.description.toLowerCase().includes(keyword1)) && (item.description && item.description.toLowerCase().includes(keyword2))));
          const filteredArray1 = itemTitles.filter(function(el) {
            return firstFilter.indexOf(el) < 0;
          });
          const secondFilter = filteredArray1.filter((item) => item.title.toLowerCase().includes(keyword1) || (item.description && item.description.toLowerCase().includes(keyword1)));
          const filteredArray2 = filteredArray1.filter(function(el) {
            return secondFilter.indexOf(el) < 0;
          });
          const thirdFilter = filteredArray2.filter((item) => item.title.toLowerCase().includes(keyword2) || (item.description && item.description.toLowerCase().includes(keyword2)));
          finalResult = finalResult.concat(firstFilter, secondFilter, thirdFilter);
        } else if (keywords.length === 1) {
          const filterItems = itemTitles.filter((item) => item.title.toLowerCase().includes(keyword) || (item.description && item.description.toLowerCase().includes(keyword)));
          finalResult = finalResult.concat(filterItems);
        }

        const limitItems = finalResult.slice(0, limit);

        return res.send({result: limitItems, city: req.param("city")});
      })
      .catch((err) => {
        return res.send(err);
      });
});

app.listen(port, () => console.log("Scrape function listening at Port: ", port));

exports.scrape1 = functions.https.onRequest(app);
