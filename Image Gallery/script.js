const categories = ["Food","Travel","Animals","Nature","Technology","People","Architecture","Sports"]
const gallery = document.getElementById('gallery')
const categoriesEl = document.getElementById('categories')
const searchForm = document.getElementById('searchForm')
const searchInput = document.getElementById('searchInput')
const loadMoreBtn = document.getElementById('loadMore')
const categoryPanel = document.getElementById('categoryPanel')
const categoryTitle = document.getElementById('categoryTitle')
const categoryClear = document.getElementById('categoryClear')
const categorySearchForm = document.getElementById('categorySearchForm')
const categorySearchInput = document.getElementById('categorySearchInput')

let currentQuery = 'popular'
let page = 1
let images = []
let totalPages = Infinity
const PER_PAGE = 30
let currentCategory = ''

const UNSPLASH_KEY = (window && window.UNSPLASH_ACCESS_KEY) ? window.UNSPLASH_ACCESS_KEY.trim() : ''

function showErrorBanner(msg){
  console.error(msg)
  const existing = document.getElementById('errorBanner')
  if(existing) existing.remove()
  const div = document.createElement('div')
  div.id = 'errorBanner'
  div.textContent = msg
  Object.assign(div.style, {background:'#ffeeee',color:'#900',padding:'8px 12px',borderBottom:'1px solid #f2c2c2',fontFamily:'sans-serif'})
  document.body.prepend(div)
}

function renderCategories(){
  if(!categoriesEl) return
  categories.forEach(cat => {
    const btn = document.createElement('button')
    btn.textContent = cat
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.categories button').forEach(b=>b.classList.remove('active'))
      btn.classList.add('active')
      enterCategory(cat)
    })
    categoriesEl.appendChild(btn)
  })
}

function clearGallery(){ gallery.innerHTML = ''; images = []; page = 1; totalPages = Infinity }

async function fetchUnsplash(q, pageNum){
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&page=${pageNum}&per_page=${PER_PAGE}`
  const res = await fetch(url, {headers: {Authorization: `Client-ID ${UNSPLASH_KEY}`}})
  if(!res.ok) throw new Error('Unsplash API error')
  const data = await res.json()
  totalPages = data.total_pages || 1
  return data.results.map(r => ({thumb: r.urls.small, full: r.urls.full || r.urls.raw, alt: r.alt_description || r.description || q}))
}

function buildSourceImage(query, sig, size = '800x600'){
  return `https://source.unsplash.com/${size}/?${encodeURIComponent(query)}&sig=${sig}`
}

async function loadImages(q){
  if(UNSPLASH_KEY){
    if(page > totalPages) return
    try{
      loadMoreBtn.disabled = true
      const results = await fetchUnsplash(q, page)
      results.forEach(img => appendImage(img))
      page++
    }catch(err){
      console.error('Unsplash fetch failed, falling back to source', err)
      // fallback to source
      loadFromSource(q)
    }finally{ loadMoreBtn.disabled = false }
  }else{
    loadFromSource(q)
  }
}

function loadFromSource(q, count = PER_PAGE){
  const start = (page - 1) * count
  for(let i=0;i<count;i++){
    const idx = start + i
    const thumb = buildSourceImage(q, idx, '400x300')
    const full = buildSourceImage(q, idx + 10000, '1200x900')
    appendImage({thumb, full, alt: q})
  }
  page++
}

function appendImage({thumb, full, alt}){
  const index = images.length
  images.push({thumb, full, alt})
  const card = document.createElement('div')
  card.className = 'card'
  const img = document.createElement('img')
  img.src = thumb
  img.alt = alt || currentQuery
  img.loading = 'lazy'
  card.appendChild(img)
  card.addEventListener('click', ()=> openModal(index))
  gallery.appendChild(card)
}

function startSearch(q){
  // top-level search (not within a selected category)
  currentCategory = ''
  hideCategoryPanel()
  currentQuery = q
  clearGallery()
  loadImages(q)
}

function enterCategory(cat){
  currentCategory = cat
  currentQuery = cat
  categoryTitle.textContent = cat
  categorySearchInput.value = ''
  showCategoryPanel()
  clearGallery()
  loadImages(cat)
}

function showCategoryPanel(){ categoryPanel.hidden = false }
function showCategoryPanel(){ if(categoryPanel) categoryPanel.hidden = false }
function hideCategoryPanel(){ if(categoryPanel) categoryPanel.hidden = true }

if(categoryClear){
  categoryClear.addEventListener('click', ()=>{
    // exit category view
    document.querySelectorAll('.categories button').forEach(b=>b.classList.remove('active'))
    currentCategory = ''
    hideCategoryPanel()
    clearGallery()
  })
} else {
  // element missing
  console.warn('categoryClear element not found')
}

if(categorySearchForm){
  categorySearchForm.addEventListener('submit', e=>{
    e.preventDefault()
    const q = categorySearchInput.value.trim()
    if(!currentCategory) return
    const combined = q ? `${currentCategory} ${q}` : currentCategory
    currentQuery = combined
    clearGallery()
    loadImages(combined)
  })
} else {
  console.warn('categorySearchForm element not found')
}

// Modal
const modal = document.getElementById('modal')
const modalImage = document.getElementById('modalImage')
const modalClose = document.getElementById('modalClose')
const modalBackdrop = document.getElementById('modalBackdrop')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const downloadBtn = document.getElementById('downloadBtn')
let currentIndex = 0

function openModal(index){
  currentIndex = index
  updateModal()
  modal.classList.add('show')
  modal.setAttribute('aria-hidden','false')
}

function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true') }

function updateModal(){
  const img = images[currentIndex]
  if(!img) return
  modalImage.src = img.full
  modalImage.alt = img.alt || currentQuery
  downloadBtn.href = img.full
}

if(prevBtn) prevBtn.addEventListener('click', ()=>{
  currentIndex = (currentIndex-1+images.length)%images.length
  updateModal()
})
else console.warn('prevBtn not found')
if(nextBtn) nextBtn.addEventListener('click', ()=>{
  currentIndex = (currentIndex+1)%images.length
  updateModal()
})
else console.warn('nextBtn not found')
if(modalClose) modalClose.addEventListener('click', closeModal)
if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal)
document.addEventListener('keydown', (e)=>{
  if(modal.classList.contains('show')){
    if(e.key === 'Escape') closeModal()
    if(e.key === 'ArrowLeft') prevBtn.click()
    if(e.key === 'ArrowRight') nextBtn.click()
  }
})

// UI interactions
if(searchForm){
  searchForm.addEventListener('submit', e=>{
    e.preventDefault()
    const q = searchInput.value.trim()
    if(!q) return
    // clear any active category
    document.querySelectorAll('.categories button').forEach(b=>b.classList.remove('active'))
    startSearch(q)
  })
} else {
  showErrorBanner('Search form not found — check that index.html contains an element with id="searchForm"')
}

if(loadMoreBtn) loadMoreBtn.addEventListener('click', ()=> loadImages(currentQuery))

// Init
try{
  renderCategories()
  const firstBtn = document.querySelectorAll('.categories button')[0]
  if(firstBtn){
    firstBtn.classList.add('active')
    startSearch(categories[0])
  } else {
    // no categories rendered — attempt a default search
    startSearch('popular')
  }
}catch(err){
  showErrorBanner('Initialization error: '+ (err && err.message ? err.message : String(err)))
}
