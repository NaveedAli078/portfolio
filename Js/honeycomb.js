/* ============================================================
   HONEYCOMB GALLERY JAVASCRIPT
   Dynamic hexagon generation, filtering, and interactions
   ============================================================ */

'use strict';

/* ═══════════════════════════════════════════════
   PROJECT DATA
   ═══════════════════════════════════════════════
   
   HOW TO ADD A NEW PROJECT:
   
   1. Add a new object to the projectsData array below
   2. Fill in all fields:
      - title: Project name (shown on hover)
      - image: Path to project image (from root folder)
      - link: URL or page to open when clicked
      - category: Array of categories this project belongs to
      - year: Year the project was completed (for date filtering)
   3. Save and reload the page
   
   CATEGORIES:
   - 'visualizations'  → Visualizations
   - 'cartographic'    → Cartographic Work
   - 'selected'        → Selected Projects
   
   The script automatically handles 'all', 'before-2024', and '2024-later'
*/

const projectsData = [
  // Visualizations
  {
    title: 'Urban Growth Analysis',
    image: 'Media/Urban.png',
    link: 'Pages/urbanization.html',
    category: ['visualizations', 'selected'],
    year: 2024
  },
  {
    title: 'Statistical Data Visualization',
    image: 'Media/Static.png',
    link: 'https://github.com/naveedali786/Statistical-Data-Visualization',
    category: ['visualizations'],
    year: 2024
  },
  {
    title: 'Animation & 3D Visualization',
    image: 'Media/Animate.png',
    link: 'https://github.com/naveedali786',
    category: ['visualizations', 'selected'],
    year: 2024
  },
  {
    title: 'Climate Change Analysis',
    image: 'Media/Climate change.png',
    link: 'Pages/Climate_change.html',
    category: ['visualizations', 'selected'],
    year: 2024
  },
  {
    title: 'Nature Resource Monitoring',
    image: 'Media/Nature.png',
    link: 'Pages/Nature_resoure.html',
    category: ['visualizations'],
    year: 2023
  },
  {
    title: 'WebGIS Dashboard',
    image: 'Media/Webapp.png',
    link: 'https://github.com/naveedali786',
    category: ['visualizations', 'selected'],
    year: 2024
  },

  // Cartographic Work
  {
    title: 'Swat Basin Aspect Analysis',
    image: 'Gallerys/aspect_swat_basin_publication_ready.webp',
    link: '#cartographic',
    category: ['cartographic', 'selected'],
    year: 2024
  },
  {
    title: 'Evaporative Stress Index Punjab',
    image: 'Gallerys/Evaporative_Stress_Index_Punjab_Compact.webp',
    link: '#cartographic',
    category: ['cartographic'],
    year: 2024
  },
  {
    title: 'Geological Map Potohar',
    image: 'Gallerys/Geological_Potohar_Map_Compact.webp',
    link: '#cartographic',
    category: ['cartographic', 'selected'],
    year: 2023
  },
  {
    title: 'Kriging Rainfall Interpolation',
    image: 'Gallerys/kriging_rainfall_2010_publication_ready.webp',
    link: '#cartographic',
    category: ['cartographic'],
    year: 2023
  },
  {
    title: 'Swat Basin Elevation Map',
    image: 'Gallerys/Swat_Basin_Elevation_Map_Publication_Ready.webp',
    link: '#cartographic',
    category: ['cartographic', 'selected'],
    year: 2024
  },
  {
    title: 'Wheat Grain Zinc Mapping',
    image: 'Gallerys/wheat_grain_zinc_publication_ready.webp',
    link: '#cartographic',
    category: ['cartographic'],
    year: 2023
  },

  // Selected Projects
  {
    title: '30 Day Map Challenge 2024',
    image: 'Project/30 Days.webp',
    link: 'https://github.com/naveedali786/30Day-Map-Challenge-2024-',
    category: ['selected'],
    year: 2024
  },
  {
    title: '30 Day Python DataViz',
    image: 'Project/30 Days_python.webp',
    link: 'https://github.com/naveedali786/30Day-Mapping-and-visualization-Challenge-with-Python',
    category: ['selected'],
    year: 2024
  },
  {
    title: 'Google Earth Engine Projects',
    image: 'Project/30 Days_Gee.webp',
    link: 'https://github.com/naveedali786/GEE_Projects',
    category: ['selected'],
    year: 2024
  },
  {
    title: 'Machine Learning for GIS',
    image: 'Project/30 Days_ML.webp',
    link: 'https://github.com/naveedali786/ML-AI-Projects',
    category: ['selected'],
    year: 2024
  },
  {
    title: 'GIS Spatial Analysis',
    image: 'Project/30 Days_gis.webp',
    link: 'https://github.com/naveedali786/GIS-and-Remote-Sensing-Analysis',
    category: ['selected'],
    year: 2024
  },
  {
    title: 'Cartographic Collection',
    image: 'Project/30_map.webp',
    link: 'https://github.com/naveedali786',
    category: ['selected', 'cartographic'],
    year: 2023
  },
  
  // Additional projects - you can add more here
  {
    title: 'Cartographic Design',
    image: 'Media/Cartographic.png',
    link: 'https://github.com/naveedali786',
    category: ['cartographic', 'selected'],
    year: 2023
  },
  {
    title: 'Open Source GIS',
    image: 'Media/Open.png',
    link: 'Pages/Open_sourec.html',
    category: ['selected'],
    year: 2023
  }
];

/* ═══════════════════════════════════════════════
   DOM ELEMENTS
═══════════════════════════════════════════════ */
const honeycombContainer = document.getElementById('honeycombContainer');
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const currentCategory = document.getElementById('currentCategory');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const loading = document.getElementById('loading');

/* ═══════════════════════════════════════════════
   GENERATE HEXAGONS
═══════════════════════════════════════════════ */
function generateHexagons() {
  honeycombContainer.innerHTML = '';
  
  projectsData.forEach((project, index) => {
    // Create hexagon item
    const hexItem = document.createElement('div');
    hexItem.className = 'hex-item';
    hexItem.dataset.categories = project.category.join(' ');
    hexItem.dataset.year = project.year;
    
    // Create link
    const hexLink = document.createElement('a');
    hexLink.className = 'hex-link';
    hexLink.href = project.link;
    hexLink.title = project.title;
    
    // For external links, open in new tab
    if (project.link.startsWith('http')) {
      hexLink.target = '_blank';
      hexLink.rel = 'noopener noreferrer';
    }
    
    // Create hexagon shape
    const hexShape = document.createElement('div');
    hexShape.className = 'hex-shape';
    
    // Create image
    const hexImage = document.createElement('img');
    hexImage.className = 'hex-image';
    hexImage.src = project.image;
    hexImage.alt = project.title;
    hexImage.loading = 'lazy'; // Lazy loading
    
    // Create overlay
    const hexOverlay = document.createElement('div');
    hexOverlay.className = 'hex-overlay';
    
    // Create border (shown on hover)
    const hexBorder = document.createElement('div');
    hexBorder.className = 'hex-border';
    
    // Create title tooltip
    const hexTitle = document.createElement('div');
    hexTitle.className = 'hex-title';
    hexTitle.textContent = project.title;
    
    // Assemble hexagon
    hexShape.appendChild(hexImage);
    hexShape.appendChild(hexOverlay);
    hexLink.appendChild(hexShape);
    hexLink.appendChild(hexBorder);
    hexLink.appendChild(hexTitle);
    hexItem.appendChild(hexLink);
    
    honeycombContainer.appendChild(hexItem);
    
    // Touch support for mobile
    hexItem.addEventListener('touchstart', handleTouchStart, { passive: true });
  });
  
  // Hide loading after hexagons are generated
  setTimeout(() => {
    loading.classList.add('hide');
  }, 500);
}

/* ═══════════════════════════════════════════════
   TOUCH SUPPORT FOR MOBILE
═══════════════════════════════════════════════ */
let touchTimeout = null;

function handleTouchStart(e) {
  const hexItem = e.currentTarget;
  
  // Toggle touched class
  const wasTouched = hexItem.classList.contains('touched');
  
  // Remove touched from all hexagons
  document.querySelectorAll('.hex-item').forEach(item => {
    item.classList.remove('touched');
  });
  
  // If this wasn't already touched, touch it now
  if (!wasTouched) {
    hexItem.classList.add('touched');
    
    // Remove touch after 3 seconds
    clearTimeout(touchTimeout);
    touchTimeout = setTimeout(() => {
      hexItem.classList.remove('touched');
    }, 3000);
  }
}

// Remove touch class when tapping outside
document.addEventListener('touchstart', (e) => {
  if (!e.target.closest('.hex-item')) {
    document.querySelectorAll('.hex-item').forEach(item => {
      item.classList.remove('touched');
    });
  }
}, { passive: true });

/* ═══════════════════════════════════════════════
   FILTER HEXAGONS
═══════════════════════════════════════════════ */
function filterHexagons(filterCategory) {
  const hexItems = document.querySelectorAll('.hex-item');
  
  hexItems.forEach(item => {
    const categories = item.dataset.categories;
    const year = parseInt(item.dataset.year);
    let shouldShow = false;
    
    if (filterCategory === 'all') {
      shouldShow = true;
    } else if (filterCategory === 'before-2024') {
      shouldShow = year < 2024;
    } else if (filterCategory === '2024-later') {
      shouldShow = year >= 2024;
    } else {
      shouldShow = categories.includes(filterCategory);
    }
    
    if (shouldShow) {
      item.classList.remove('hidden');
      // Re-trigger animation
      item.style.animation = 'none';
      setTimeout(() => {
        item.style.animation = '';
      }, 10);
    } else {
      item.classList.add('hidden');
    }
  });
  
  // Scroll to top smoothly after filtering
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/* ═══════════════════════════════════════════════
   DROPDOWN MENU
═══════════════════════════════════════════════ */
dropdownBtn.addEventListener('click', () => {
  dropdownMenu.classList.toggle('show');
  dropdownBtn.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown-container')) {
    dropdownMenu.classList.remove('show');
    dropdownBtn.classList.remove('active');
  }
});

// Handle category selection
dropdownMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    const category = e.target.dataset.category;
    const categoryText = e.target.textContent;
    
    // Update button text
    currentCategory.textContent = categoryText;
    
    // Close dropdown
    dropdownMenu.classList.remove('show');
    dropdownBtn.classList.remove('active');
    
    // Filter hexagons
    filterHexagons(category);
  }
});

// Close dropdown on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dropdownMenu.classList.remove('show');
    dropdownBtn.classList.remove('active');
  }
});

/* ═══════════════════════════════════════════════
   SCROLL TO TOP BUTTON
═══════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

/* ═══════════════════════════════════════════════
   IMAGE LAZY LOADING FALLBACK
   (for older browsers that don't support native lazy loading)
═══════════════════════════════════════════════ */
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  // Observe images after they're generated
  setTimeout(() => {
    document.querySelectorAll('.hex-image[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }, 100);
}

/* ═══════════════════════════════════════════════
   KEYBOARD NAVIGATION
═══════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  // Allow Enter or Space to activate hexagons
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.hex-link')) {
    e.preventDefault();
    e.target.closest('.hex-link').click();
  }
});

/* ═══════════════════════════════════════════════
   INITIALIZATION
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  generateHexagons();
  
  // Log info to console
  console.log(`✅ Honeycomb Gallery loaded with ${projectsData.length} projects`);
  console.log('📊 Categories:', [...new Set(projectsData.flatMap(p => p.category))]);
});

/* ═══════════════════════════════════════════════
   PERFORMANCE OPTIMIZATION
═══════════════════════════════════════════════ */

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    console.log('Window resized:', window.innerWidth + 'px');
  }, 250);
}, { passive: true });

// Prefetch images on hover (desktop only)
if (window.innerWidth > 768) {
  document.addEventListener('mouseover', (e) => {
    const hexLink = e.target.closest('.hex-link');
    if (hexLink) {
      const link = new Image();
      link.src = hexLink.href;
    }
  }, { passive: true, once: true });
}

/* ═══════════════════════════════════════════════
   ERROR HANDLING
═══════════════════════════════════════════════ */

// Handle image load errors
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    console.warn('Failed to load image:', e.target.src);
    // You can set a fallback image here
    // e.target.src = 'path/to/fallback-image.jpg';
  }
}, true);

// Log any JavaScript errors
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.message, 'at', e.filename, 'line', e.lineno);
});

/* ═══════════════════════════════════════════════
   ANALYTICS (Optional)
═══════════════════════════════════════════════ */

// Track project clicks (add your analytics code here)
honeycombContainer.addEventListener('click', (e) => {
  const hexLink = e.target.closest('.hex-link');
  if (hexLink) {
    const projectTitle = hexLink.querySelector('.hex-title').textContent;
    console.log('Project clicked:', projectTitle);
    
    // Example: Google Analytics event
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', 'project_click', {
    //     'event_category': 'Gallery',
    //     'event_label': projectTitle
    //   });
    // }
  }
});
