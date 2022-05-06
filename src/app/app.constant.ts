export const FIRESTORE = {
  ACTION: 'Action',
  CONNECTION: 'Connection',
  CRUD: 'Crud',
  REQUEST: 'Request',
  REQUEST_CONNECTION: 'Request-Connection'
};

export const DATABASE = {
  ADMIN: 'Admin',
  CATEGORIES: 'Categories',
  CHAT: 'Chat',
  FAVOURITE: 'Favourite',
  NOTIFICATIONS: 'Notifications',
  TICKER: 'Ticker',
  USERS: 'users',
};

export const STORAGE = {
  CHAT_MESSAGE_IMAGES: 'chat-message-images',
  CHAT_MESSAGE_VIDEOS: 'chat-message-videos',
  CHAT_MESSAGE_ICONS: 'chat-message-icons',
  CRUD_BACKGROUND_IMAGES: 'crud-background-images',
  CRUD_ITEMS_IMAGES: 'crud-item-images',
  CRUD_MAP_ICONS: 'crud-map-icons',
  USER_PROFILE_IMAGES: 'user-profile-images',
  USER_VERIFICATION_IMAGES: 'user-verification-images',
  REQUEST_IMAGES: 'request-images'
};


export const CATEGORIES = ['Experiences', 'Stays', 'Things', 'Services', 'Transportation', 'NonProfit', 'Financial', 'Fundraising', 'Education Online'];


export interface ScrapeSite {
  siteId: number;
  name: string;
  logo: string;
  siteURL: string;
  description: string;
  category: string;
  data: any;
  size: number;
  local: boolean;
}

export const AllScrapeSites: ScrapeSite[] = [
  {siteId: 4, name: 'AirBnB', logo: '/assets/scrape/airbnb.png', siteURL: 'https://www.airbnb.com', description: 'Airbnb is an online marketplace that connects people who want to rent out their homes with people who are looking for accommodations in that locale.', category: 'Stays', data: [], size: 0, local: true},
  {siteId: 0, name: 'AirBnB', logo: '/assets/scrape/airbnb.png', siteURL: 'https://www.airbnb.com', description: 'Discover and Book Unique Experiences Hosted by Local Experts. Go Beyond a Typical Tour. Airbnb Experiences are Unique Activities Designed and Led by Inspiring Locals.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 1, name: 'Viator', logo: '/assets/scrape/viator.png', siteURL: 'https://www.viator.com', description: 'Viator lets operators create bookable products. A global tours and attractions business that Tripadvisor acquired in August of 2014.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 2, name: 'Eatwith', logo: '/assets/scrape/eatwith.png', siteURL: 'https://www.eatwith.com', description: 'Food experiences with incredible hosts online and around the world.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 3, name: 'Mealshare', logo: '/assets/scrape/mealshare.png', siteURL: 'https://mealshare.ca/en', description: 'Buy a meal, give a meal.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 46, name: 'Context', logo: '/assets/scrape/context.png', siteURL: 'https://www.contexttravel.com', description: 'Learning Experiences at Home and Abroad.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 47, name: 'ShareGrid', logo: '/assets/scrape/sharegrid.png', siteURL: 'https://www.sharegrid.com', description: 'The largest, most trusted camera sharing community.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 48, name: 'Hipcamp', logo: '/assets/scrape/hitcamp.png', siteURL: 'https://www.hipcamp.com', description: 'Discover and book tent camping, RV parks, cabins, treehouses and glamping.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 49, name: 'RVezy', logo: '/assets/scrape/rvezy.png', siteURL: 'https://www.rvezy.com', description: 'Find the perfect RV rental.', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 15, name: 'Afar', logo: '/assets/scrape/afar.png', siteURL: 'https://www.afar.com/', description: 'Where do you want to go?', category: 'Experiences', data: [], size: 0, local: true},
  {siteId: 5, name: 'Wework', logo: '/assets/scrape/wework.png', siteURL: 'https://www.wework.com', description: 'Reimagine your workspace', category: 'Stays', data: [], size: 0, local: true},
  {siteId: 6, name: 'FurnishedFinder', logo: '/assets/scrape/furnishedfinder.png', siteURL: 'https://www.furnishedfinder.com/', description: 'Monthly furnished rentals for travel nurses & other traveling professionals.', category: 'Stays', data: [], size: 0, local: true},
  // {siteId: 7, name: 'Neighbor', logo: '/assets/scrape/neighbor.png', siteURL: 'https://www.neighbor.com', description: 'Store your stuff with a neighbor', category: 'Stays', data: [], size: 0, local: true},
  {siteId: 8, name: 'Rent the backyard', logo: '/assets/scrape/rentthebackyard.png', siteURL: 'https://rentthebackyard.com', description: 'Earn income by building a home in your backyard.', category: 'Stays', data: [], size: 0, local: false},
  {siteId: 9, name: 'JustPark', logo: '/assets/scrape/justpark.png', siteURL: 'https://www.justpark.com', description: 'Find parking in seconds.', category: 'Stays', data: [], size: 0, local: true},
  {siteId: 10, name: 'Zeus Living', logo: '/assets/scrape/zeusliving.png', siteURL: 'https://zeusliving.com', description: '', category: 'Stays', data: [], size: 0, local: true},
  {siteId: 12, name: 'Couchsurfing', logo: '/assets/scrape/couchsurfing.png', siteURL: 'https://www.couchsurfing.com', description: '', category: 'Stays', data: [], size: 0, local: true},
  {siteId: 13, name: 'Campspace', logo: '/assets/scrape/campspace.png', siteURL: 'https://campspace.com', description: '', category: 'Stays', data: [], size: 0, local: true},
  {siteId: 14, name: 'Sonder', logo: '/assets/scrape/sonder.png', siteURL: 'https://www.sonder.com', description: '', category: 'Stays', data: [], size: 0, local: true},
  // {siteId: 21, name: 'Spinlister', logo: '/assets/scrape/spinlister.png', siteURL: 'https://www.spinlister.com', description: '', category: 'Things', data: [], size: 0, local: true},
  {siteId: 18, name: 'CraigsList', logo: '/assets/scrape/craigslist.png', siteURL: 'https://www.craigslist.org', description: '', category: 'Things', data: [], size: 0, local: true},
  {siteId: 22, name: 'Postmates', logo: '/assets/scrape/postmates.png', siteURL: 'https://postmates.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 23, name: 'TaskRabbit', logo: '/assets/scrape/taskrabbit.png', siteURL: 'https://www.taskrabbit.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 24, name: 'Guru', logo: '/assets/scrape/guru.png', siteURL: 'https://www.guru.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 25, name: 'Handy', logo: '/assets/scrape/handy.png', siteURL: 'https://shop.handy.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 26, name: 'Silvernest', logo: '/assets/scrape/silvernest.png', siteURL: 'https://www.silvernest.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 27, name: 'Instacart', logo: '/assets/scrape/instacart.png', siteURL: 'https://www.instacart.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 28, name: 'AppJobs', logo: '/assets/scrape/appjobs.png', siteURL: 'https://www.appjobs.com', description: '', category: 'Services', data: [], size: 0, local: true}, {siteId: 30, name: 'Rover', logo: '/assets/scrape/rover.png', siteURL: 'https://www.rover.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 20, name: 'Turo', logo: '/assets/scrape/turo.png', siteURL: 'https://turo.com', description: '', category: 'Transportation', data: [], size: 0, local: true},
  {siteId: 31, name: 'Zipcar', logo: '/assets/scrape/zipcar.png', siteURL: 'https://www.zipcar.com', description: '', category: 'Transportation', data: [], size: 0, local: true},
  {siteId: 32, name: 'CaregiverJobsNow', logo: '/assets/scrape/caregiverjobsnow.png', siteURL: 'https://caregiverjobsnow.com', description: '', category: 'Services', data: [], size: 0, local: true},
  {siteId: 33, name: 'Outdoorsy', logo: '/assets/scrape/outdoorsy.png', siteURL: 'https://www.outdoorsy.com', description: '', category: 'Transportation', data: [], size: 0, local: true},
  {siteId: 34, name: 'RVShare', logo: '/assets/scrape/rvshare.png', siteURL: 'https://rvshare.com', description: '', category: 'Transportation', data: [], size: 0, local: true},
  {siteId: 36, name: 'Sharedadventures', logo: '/assets/scrape/sharedadventures.png', siteURL: 'https://www.sharedadventures.org', description: '', category: 'NonProfit', data: [], size: 0, local: false},
  {siteId: 38, name: 'Indiegogo', logo: '/assets/scrape/indiegogo.png', siteURL: 'https://www.indiegogo.com', description: '', category: 'Fundraising', data: [], size: 0, local: false},
  {siteId: 39, name: 'Wefunder', logo: '/assets/scrape/wefunder.png', siteURL: 'https://wefunder.com', description: '', category: 'Fundraising', data: [], size: 0, local: false},
  {siteId: 40, name: 'Localstake', logo: '/assets/scrape/localstake.png', siteURL: 'https://localstake.com', description: '', category: 'Fundraising', data: [], size: 0, local: false},
  {siteId: 41, name: 'Seedinvest', logo: '/assets/scrape/seedinvest.png', siteURL: 'https://www.seedinvest.com', description: '', category: 'Fundraising', data: [], size: 0, local: false},
  {siteId: 42, name: 'Fundable', logo: '/assets/scrape/fundable.png', siteURL: 'https://www.fundable.com', description: '', category: 'Fundraising', data: [], size: 0, local: false},
  {siteId: 43, name: 'Equitynet', logo: '/assets/scrape/equitynet.png', siteURL: 'https://www.equitynet.com', description: '', category: 'Fundraising', data: [], size: 0, local: false},
  {siteId: 45, name: 'Coursera', logo: '/assets/scrape/coursera.png', siteURL: 'https://www.coursera.org', description: '', category: 'Services, Online Education', data: [], size: 0, local: false}
];

export const StaticSites = [
  /*
  {siteId: 17, name: 'Lyric', logo: '/assets/scrape/lyric.png', siteURL: 'https://www.lyric.com', description: '', category: 'Stays',
      cards: [
          {title: 'How it works', color: 'black', link: 'https://www.lyric.com', 'background-color': 'white', 'background-image': ''},
          {title: 'Second card', color: 'red', link: 'https://www.lyric.com', 'background-color': 'lightgray', 'background-image': 'https://picsum.photos/id/102/4320/3240'},
          {title: 'Third card', color: 'black', link: 'https://www.lyric.com', 'background-color': 'gray', 'background-image': ''},
          {title: 'Fourth card', color: 'black', link: 'https://www.lyric.com', 'background-color': 'darkgray', 'background-image': ''}
      ]
  },
  */
  {
    siteId: 19,
    name: 'Londr',
    logo: '',
    siteURL: 'https://londr.com/',
    description: 'Laundry Washed. Folded. Delivered.',
    category: 'Service',
    cards: [
      {
        title: 'How it works',
        color: 'white',
        link: 'https://londr.com/',
        'background-color': '',
        'background-image': 'https://londr.com/Washer_Open_Washer.6efbad00.jpg'
      },
      {
        title: 'Be a washer',
        color: 'white',
        link: 'https://londr.com/washer',
        'background-color': '',
        'background-image': 'https://londr.com/laundry-bag-porch.e859bf00.jpg'
      },
      {
        title: 'Launder with Londr',
        color: 'white',
        link: 'https://londr.com/services',
        'background-color': '',
        'background-image': 'https://londr.com/join-family-mobile.d9368ac3.jpg'
      }
    ]
  },
  {
    siteId: 29,
    name: 'Skillshare',
    logo: '/assets/scrape/skillshare.png',
    siteURL: 'https://www.skillshare.com/',
    description: 'Join skillshare to watch, play, learn, make, and discover',
    category: 'Services, Online Education',
    cards: [
      {
        title: 'How it works',
        color: 'white',
        link: 'https://www.skillshare.com/',
        'background-color': 'white',
        'background-image': 'https://static.skillshare.com/cdn-cgi/image/width=448,quality=85,format=auto/uploads/video/thumbnails/59691f1eaf653294ec756289c46f3cd0/original'
      },
      {
        title: 'Classes',
        color: 'white',
        link: 'https://www.skillshare.com/browse?via=header',
        'background-color': 'lightgray',
        'background-image': 'https://static.skillshare.com/cdn-cgi/image/quality=85,format=auto/assets/images/browse/browse-banner-3.webp'
      },
      {
        title: 'Workshops',
        color: 'white',
        link: 'https://www.skillshare.com/workshops?via=header',
        'background-color': 'lightgray',
        'background-image': 'https://static.skillshare.com/uploads/discussion/tmp/d48486b5.jpg'
      }
    ]
  },
  {
    siteId: 80,
    name: 'Swimply',
    logo: '',
    siteURL: 'http://www.swimply.com/',
    description: 'Swimply is an online platform for pool sharing.',
    category: 'Service, Things',
    cards: [
      {
        title: 'How it works',
        color: 'white',
        link: 'http://www.swimply.com/',
        'background-color': 'white',
        'background-image': 'https://swimply.com/img/cropped-home-new-banner.jpg'
      },
      {
        title: 'Find a pool',
        color: 'white',
        link: 'http://www.swimply.com/',
        'background-color': 'lightgray',
        'background-image': 'https://s3.amazonaws.com/swimplyinc-prod/thumbnails/VCdbnE4Nxn6YSwxJgBnxd2lehmOk0vLrqdHK2J7n.jpeg'
      },
      {
        title: 'List your pool',
        color: 'white',
        link: 'https://swimply.com/listyourpool',
        'background-color': 'lightgray',
        'background-image': 'https://swimply.com/img/listpool_yourbank.jpg'
      },
    ]
  },
  {
    siteId: 81,
    name: 'Joyspace',
    logo: '',
    siteURL: 'http://www.joyspaceapp.com/',
    description: 'Rent or list anything from Private Tennis and basketball courts, to home gyms and theaters.',
    category: 'Service, Things',
    cards: [
      {
        title: 'How it works',
        color: 'white',
        link: 'http://www.joyspaceapp.com/',
        'background-color': 'white',
        'background-image': 'https://static.wixstatic.com/media/f7aeda_cae5daf4a130417791d6645cf202f13e~mv2.jpeg/v1/fill/w_327,h_240,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01/f7aeda_cae5daf4a130417791d6645cf202f13e~mv2.webp'
      },
      {
        title: 'Host a space',
        color: 'white',
        link: 'https://docs.google.com/forms/d/e/1FAIpQLSfbNd0rybMomoVC-BsQLuyFh5hu4jxfuAiAI1nPpE4zTUNl8A/viewform?vc=0&c=0&w=1',
        'background-color': 'lightgray',
        'background-image': 'https://static.wixstatic.com/media/f7aeda_d67b40f6075b45f0b67ea8f5ce8c33ef~mv2.jpeg/v1/fill/w_326,h_240,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01/f7aeda_d67b40f6075b45f0b67ea8f5ce8c33ef~mv2.webp'
      },
      {
        title: 'Join',
        color: 'white',
        link: 'https://www.joyspaceapp.com/join-owner-waitlist',
        'background-color': 'white',
        'background-image': 'https://static.wixstatic.com/media/f7aeda_7e7d90479b0840e29a26bfc34e333709~mv2.jpg/v1/fill/w_490,h_640,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01/f7aeda_7e7d90479b0840e29a26bfc34e333709~mv2.webp'
      },
    ]
  },
  /*
  {siteId: 82, name: 'The Whizz App', logo: '', siteURL: 'http://www.whizzapp.com/', description: 'Find a local restroom', category: 'Service',
      cards: [
          {title: 'How it works', color: 'black', link: 'http://www.whizzapp.com/', 'background-color': 'white', 'background-image': ''},
          {title: 'Second card', color: 'black', link: 'http://www.whizzapp.com/', 'background-color': 'lightgray', 'background-image': ''}
      ]
  },
  */
  {
    siteId: 83,
    name: 'BorrowABoat',
    logo: '',
    siteURL: 'https://www.borrowaboat.com/',
    description: '35,000+ Boat Rentals and Yacht Charters Worldwide.',
    category: 'Transportation, Service, Things',
    cards: [
      {
        title: 'How it works',
        color: 'white',
        link: 'https://www.borrowaboat.com/',
        'background-color': 'white',
        'background-image': 'https://borrowaboat-eu-bucket.s3.amazonaws.com/media/images/croatia.2e16d0ba.fill-640x320.jpg'
      },
      {
        title: 'List your boat',
        color: 'white',
        link: 'https://www.borrowaboat.com/login',
        'background-color': 'lightgray',
        'background-image': 'https://borrowaboat-eu-bucket.s3.amazonaws.com/media/images/bvi.2e16d0ba.fill-396x200.jpg'
      },
      {
        title: 'Signup',
        color: 'white',
        link: 'https://www.borrowaboat.com/signup',
        'background-color': 'lightgray',
        'background-image': 'https://borrowaboat-eu-bucket.s3.amazonaws.com/media/images/turkey.2e16d0ba.fill-640x320.jpg'
      }
    ]
  },
  {
    siteId: 84,
    name: 'OilUber',
    logo: '',
    siteURL: 'https://www.oiluber.com/',
    description: 'Become a technician or get your oil changed.',
    category: 'Service',
    cards: [
      {
        title: 'How it works',
        color: 'white',
        link: 'https://www.oiluber.com/about-us',
        'background-color': 'white',
        'background-image': 'https://www.oiluber.com/static/media/engine.e3f06549.jpg'
      },
      {
        title: 'Be a Luber',
        color: 'white',
        link: 'https://www.oiluber.com/tech-info',
        'background-color': 'lightgray',
        'background-image': 'https://www.oiluber.com/blog-images/thumb.jpg'
      },
      {
        title: 'Oil Change',
        color: 'black',
        link: 'https://www.oiluber.com/oil-change',
        'background-color': 'lightgray',
        'background-image': 'https://www.oiluber.com/oiluber_client/synthetic.png'
      }
    ]
  },
  {
    siteId: 85,
    name: 'SitterCity',
    logo: '',
    siteURL: 'https://www.sittercity.com/',
    description: 'Your sitter search made simple.',
    category: 'Service',
    cards: [
      {
        title: 'How it works',
        color: 'white',
        link: 'https://www.sittercity.com/',
        'background-color': 'white',
        'background-image': 'https://www.sittercity.com/wp-content/uploads/2021/02/GettyImages-1226154745-300x200.jpg'
      },
      {
        title: 'Find child care',
        color: 'white',
        link: 'https://www.sittercity.com/prospects/location',
        'background-color': 'lightgray',
        'background-image': 'https://www.sittercity.com/wp-content/uploads/2020/08/GettyImages-495774050-300x200.jpg'
      },
      {
        title: 'Become a sitter',
        color: 'white',
        link: 'https://www.sittercity.com/',
        'background-color': 'lightgray',
        'background-image': 'https://www.sittercity.com/wp-content/uploads/2020/08/GettyImages-1243498441-medium-300x200.jpg'
      }
    ]
  },
  {
    siteId: 87,
    name: 'Yoodlize',
    logo: '',
    siteURL: 'https://www.yoodlize.com/',
    description: 'Rent your stuff. Earn cash by renting your things.',
    category: 'Service, Things, Transportation',
    cards: [
      {
        title: 'Rent your stuff',
        color: 'white',
        link: 'https://www.yoodlize.com/',
        'background-color': 'darkblue',
        'background-image': ''
      },
      {
        title: 'How it works',
        color: 'white',
        link: 'https://www.yoodlize.com/how-it-works',
        'background-color': 'darkgrey',
        'background-image': ''
      },
      {
        title: 'List an item',
        color: 'white',
        link: 'https://www.yoodlize.com/login?refer=add-listing',
        'background-color': 'black',
        'background-image': ''
      }
    ]
  },
  /*
  {siteId: 86, name: 'RideAustin', logo: '', siteURL: 'https://www.sittercity.com/', description: 'A nonprofit ride share built for Austin', category: 'Transportation',
      cards: [
          {title: 'How it works', color: 'black', link: 'https://www.sittercity.com/', 'background-color': 'white', 'background-image': ''},
          {title: 'Find Chil', color: 'black', link: 'https://www.sittercity.com/', 'background-color': 'lightgray', 'background-image': ''},
          {title: 'Second card', color: 'white', link: 'https://www.borrowaboat.com/', 'background-color': 'lightgray', 'background-image': ''}
      ]
  },
  */
];


export const SUBSCRIPTION = {
  basicAuth: 'Basic Ab2o90w5N3mbDj7hD5YKd8qCpG719BBBIVZI3tM6pRkdZUymyt1rgEV5RZFvwtIG753UoYgLuZ9796vE:EGxZTZ5hpJ1nPMY41ZTP1yoPboRH4kJpLGX3hWjEwCIOt1AwBDUwPMegiZSKklT_-K2CvWfYa27ranP_',
  supportingPlan: 'P-77R21275NJ837874ML2QMKEI',
  proPlan: 'P-4B70516812302984PL2QMMRI'
};

export const VERIFICATION = {
  US: ['DrivingLicence', 'IdentityCard', 'ResidencePermit', 'Passport']
};
