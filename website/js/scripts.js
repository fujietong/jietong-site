function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function youtubeIdFromUrl(url = '') {
  try {
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split(/[?&]/)[0];
    if (url.includes('watch?v=')) return url.split('watch?v=')[1].split('&')[0];
    if (url.includes('/embed/')) return url.split('/embed/')[1].split(/[?&]/)[0];
  } catch (e) {}
  return '';
}

function socialIconMarkup(platform, label) {
  const safe = escapeHtml(label || platform);
  const map = {
    facebook: `<i class="fa-brands fa-facebook-f"></i>`,
    instagram: `<i class="fa-brands fa-instagram"></i>`,
    tiktok: `<i class="fa-brands fa-tiktok"></i>`,
    douyin: `<i class="fa-brands fa-tiktok"></i>`,
    youtube: `<i class="fa-brands fa-youtube"></i>`,
    xiaohongshu: `<img src="assets/images/xiaohongshu.png" alt="${safe}" />`
  };
  return map[platform] || `<i class="fa-solid fa-link"></i>`;
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function setupNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navList = document.querySelector('.navbar ul');
  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      navList.classList.toggle('show');
      hamburger.classList.toggle('active');
    });
  }
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox ? lightbox.querySelector('img') : null;
  const galleryImages = document.querySelectorAll('.gallery-grid img');
  if (lightbox && lightboxImage && galleryImages.length > 0) {
    galleryImages.forEach((img) => {
      img.addEventListener('click', () => {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || 'Gallery image';
        lightbox.classList.add('open');
      });
    });
    lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
  }
}

function renderSocialLinks(site) {
  const socialWrap = document.querySelector('.social-links');
  if (!socialWrap || !site.social_links) return;
  socialWrap.innerHTML = site.social_links.map(item => `
    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(item.label)}" aria-label="${escapeHtml(item.label)}">
      ${socialIconMarkup(item.platform, item.label)}
    </a>`).join('');
}

function renderFooter(site) {
  const footerYear = document.getElementById('footer-year');
  const footerName = document.getElementById('footer-name');
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  if (footerName) footerName.textContent = site.footer_name || site.brand_name || 'Jietong Fu';
}

function renderHome(site, bio) {
  const home = site.home || {};
  const hero = document.getElementById('hero');
  if (hero && home.hero_image) hero.style.backgroundImage = `url('${home.hero_image}')`;
  const map = {
    'hero-title': home.hero_title,
    'hero-subtitle': home.hero_subtitle,
    'about-title': home.section_title,
    'about-image': home.portrait_image,
    'about-image-alt': home.portrait_alt,
    'resume-label': home.resume_label,
    'resume-file': home.resume_file,
    'teaching-label': home.teaching_label,
    'teaching-file': home.teaching_file,
  };
  if (document.getElementById('hero-title')) document.getElementById('hero-title').textContent = map['hero-title'] || '';
  if (document.getElementById('hero-subtitle')) document.getElementById('hero-subtitle').textContent = map['hero-subtitle'] || '';
  if (document.getElementById('about-title')) document.getElementById('about-title').textContent = map['about-title'] || '';
  const aboutImg = document.getElementById('about-image');
  if (aboutImg) {
    aboutImg.src = map['about-image'] || aboutImg.src;
    aboutImg.alt = map['about-image-alt'] || aboutImg.alt;
  }
  const resumeLink = document.getElementById('resume-link');
  if (resumeLink) {
    resumeLink.href = map['resume-file'] || '#';
    resumeLink.textContent = map['resume-label'] || '';
  }
  const teachingLink = document.getElementById('teaching-link');
  if (teachingLink) {
    teachingLink.href = map['teaching-file'] || '#';
    teachingLink.textContent = map['teaching-label'] || '';
  }
  const bioWrap = document.getElementById('bio-text');
  const downloadLinks = bioWrap ? bioWrap.querySelector('.download-links') : null;
  if (bioWrap && downloadLinks && bio) {
    ['p1', 'p2', 'p3', 'p4', 'p5'].forEach((key) => {
      if (bio[key]) {
        const p = document.createElement('p');
        p.textContent = bio[key];
        bioWrap.insertBefore(p, downloadLinks);
      }
    });
  }
}

function renderEvents(site, upcoming, past) {
  const labels = site.events || {};
  const upcomingTitle = document.getElementById('upcoming-title');
  const pastTitle = document.getElementById('past-title');
  if (upcomingTitle) upcomingTitle.textContent = labels.upcoming_title || 'Upcoming Events';
  if (pastTitle) pastTitle.textContent = labels.past_title || 'Past Performances';

  const upcomingWrap = document.getElementById('upcoming-list');
  if (upcomingWrap) {
    const items = (upcoming && upcoming.events) || [];
    if (!items.length) {
      upcomingWrap.innerHTML = `<p class="empty-state">${escapeHtml(labels.empty_message || '')}</p>`;
    } else {
      upcomingWrap.innerHTML = items.map(e => {
        const meta = [
          e.date ? `${escapeHtml(labels.date_label || 'Date')}: ${escapeHtml(e.date)}` : '',
          e.time ? `${escapeHtml(labels.time_label || 'Time')}: ${escapeHtml(e.time)}` : '',
          e.venue ? `${escapeHtml(labels.venue_label || 'Venue')}: ${escapeHtml(e.venue)}` : ''
        ].filter(Boolean).join('<br/>');
        return `<article class="show-card">
          <h3>${escapeHtml(e.title)}</h3>
          ${e.description ? `<p>${escapeHtml(e.description)}</p>` : ''}
          ${meta ? `<p class="event-meta">${meta}</p>` : ''}
          ${e.link ? `<a href="${escapeHtml(e.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.details_label || 'Details')}</a>` : ''}
        </article>`;
      }).join('');
    }
  }

  const pastWrap = document.getElementById('past-list');
  if (pastWrap && past && past.events) {
    pastWrap.innerHTML = past.events.map(e => `
      <article class="show-card">
        <h3>${escapeHtml(e.title)}</h3>
        <p class="event-meta">
          ${e.year ? `${escapeHtml(e.year)}<br/>` : ''}
          ${e.venue ? `${escapeHtml(e.venue)}` : ''}
        </p>
        ${e.link ? `<a href="${escapeHtml(e.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.details_label || 'Details')}</a>` : ''}
      </article>`).join('');
  }
}

function renderGallery(site, gallery, videos) {
  const gallerySettings = site.gallery || {};
  const galleryTitle = document.getElementById('gallery-title');
  const videoTitle = document.getElementById('video-title');
  if (galleryTitle) galleryTitle.textContent = gallerySettings.section_title || 'Gallery';
  if (videoTitle) videoTitle.textContent = gallerySettings.video_section_title || 'Videos';

  const grid = document.getElementById('gallery-grid');
  if (grid && gallery && gallery.images) {
    grid.innerHTML = gallery.images.map(img => `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}" loading="lazy" />`).join('');
  }

  const videoList = document.getElementById('video-list');
  if (videoList && videos && videos.videos) {
    videoList.innerHTML = videos.videos.map(v => {
      const id = youtubeIdFromUrl(v.url);
      return `<article class="show-card">
        <h3>${escapeHtml(v.title)}</h3>
        ${id ? `<iframe width="100%" height="240" src="https://www.youtube.com/embed/${escapeHtml(id)}" title="${escapeHtml(v.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : ''}
      </article>`;
    }).join('');
  }
}

function renderDuo(duo) {
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };
  setText('duo-intro-title', duo.intro_title);
  setText('duo-intro-text', duo.intro_text);
  setText('duo-pianist-title', duo.pianist_section_title);
  setText('duo-pianist-subtitle', duo.pianist_subtitle);
  setText('duo-programs-title', duo.programs_title);
  setText('duo-featured-title', duo.featured_title);
  setText('duo-booking-title', duo.booking_title);
  const pianistImg = document.getElementById('duo-pianist-image');
  if (pianistImg) {
    pianistImg.src = duo.pianist_image || pianistImg.src;
    pianistImg.alt = duo.pianist_image_alt || pianistImg.alt;
  }
  const pianistText = document.getElementById('duo-pianist-text');
  if (pianistText && duo.pianist_paragraphs) {
    pianistText.innerHTML = duo.pianist_paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }
  const programs = document.getElementById('duo-programs-list');
  if (programs && duo.programs) {
    programs.innerHTML = duo.programs.map(item => `<article class="show-card compact"><h3>${escapeHtml(item)}</h3></article>`).join('');
  }
  const featured = document.getElementById('duo-featured-list');
  if (featured && duo.featured_programs) {
    featured.innerHTML = duo.featured_programs.map(item => `<article class="show-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('');
  }
  const booking = document.getElementById('duo-booking-text');
  if (booking) {
    booking.innerHTML = `${escapeHtml(duo.booking_text || '')} <a href="${escapeHtml(duo.booking_link || '#')}">${escapeHtml(duo.booking_link_label || '')}</a>`;
  }
}

function renderContact(site, lang) {
  const contact = site.contact || {};
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };
  setText('contact-title', contact.section_title);
  setText('contact-intro', contact.intro);
  setText('contact-email-label', contact.email_label);
  setText('contact-phone-label', contact.phone_label);
  setText('form-name-label', contact.form_name_label);
  setText('form-email-label', contact.form_email_label);
  setText('form-service-label', contact.form_service_label);
  setText('form-message-label', contact.form_message_label);
  setText('form-submit-label', contact.submit_label);
  setText('honeypot-label', contact.honeypot_label);

  const emailLink = document.getElementById('contact-email-link');
  if (emailLink) {
    emailLink.href = `mailto:${contact.email || ''}`;
    emailLink.textContent = contact.email || '';
  }
  const phoneLink = document.getElementById('contact-phone-link');
  if (phoneLink) {
    phoneLink.href = `tel:${contact.phone_link || ''}`;
    phoneLink.textContent = contact.phone || '';
  }
  const nameInput = document.getElementById('name');
  if (nameInput) nameInput.placeholder = contact.form_name_placeholder || '';
  const emailInput = document.getElementById('email');
  if (emailInput) emailInput.placeholder = contact.form_email_placeholder || '';
  const messageInput = document.getElementById('message');
  if (messageInput) messageInput.placeholder = contact.form_message_placeholder || '';
  const serviceSelect = document.getElementById('service');
  if (serviceSelect && contact.services) {
    serviceSelect.innerHTML = contact.services.map(item => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('');
  }
  const langField = document.getElementById('form-lang');
  if (langField) langField.value = lang;
}

function renderSuccess(site, lang) {
  const success = site.success || {};
  const href = lang === 'cn' ? 'index-cn.html' : 'index.html';
  const message1 = document.getElementById('success-message-1');
  const message2 = document.getElementById('success-message-2');
  const title = document.getElementById('success-title');
  if (title) title.textContent = success.title || '';
  if (message1) message1.textContent = success.message_1 || '';
  if (message2) {
    const prefix = lang === 'cn' ? '在此期间，欢迎浏览网站其他内容或返回' : 'In the meantime, feel free to continue exploring the site or return to the ';
    const suffix = lang === 'cn' ? '。' : '.';
    message2.innerHTML = `${prefix}<a href="${href}">${escapeHtml(success.home_link_label || '')}</a>${suffix}`;
  }
}

async function initPage() {
  setupNavigation();
  const body = document.body;
  const lang = body.dataset.lang || 'en';
  const page = body.dataset.page || 'generic';
  const base = `data/${lang}`;
  try {
    const site = await fetchJson(`${base}/site.json`);
    renderSocialLinks(site);
    renderFooter(site);
    if (page === 'home') {
      const bio = await fetchJson(`${base}/bio.json`);
      renderHome(site, bio);
    } else if (page === 'events') {
      const [upcoming, past] = await Promise.all([
        fetchJson(`${base}/events-upcoming.json`),
        fetchJson(`${base}/events-past.json`),
      ]);
      renderEvents(site, upcoming, past);
    } else if (page === 'gallery') {
      const [gallery, videos] = await Promise.all([
        fetchJson(`${base}/gallery.json`),
        fetchJson(`${base}/videos.json`),
      ]);
      renderGallery(site, gallery, videos);
      setupLightbox();
    } else if (page === 'duo') {
      const duo = await fetchJson(`${base}/duo.json`);
      renderDuo(duo);
    } else if (page === 'contact') {
      renderContact(site, lang);
    } else if (page === 'success') {
      renderSuccess(site, lang);
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', initPage);
