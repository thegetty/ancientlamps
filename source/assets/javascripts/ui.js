import debounce from 'lodash.debounce'
import moment from 'moment'
import Map from './map.js'
import Search from './search.js'
import Details from './details.js'

class UI {
  constructor () {
    // Properties
    this.menuVisible = false
    this.searchVisible = false
    this.searchInstance = null
    this.catalogueInstance = null
    this.mapInstance = null

    // Init script
    this.setup()
  }

  catNumCheck (cat) {
    if (isNaN(Number(cat))) {
      return cat
    } else {
      return Number(cat)
    }
  }

  setup () {
    // DOM Handles
    let $menuButton = $('#navbar-menu')
    let $menuCloseButton = $('#nav-menu-close')
    let $searchButton = $('#navbar-search')
    let $searchCloseButton = $('#search-close')
    let $searchInput = $('.search-field')
    let $expanderContent = $('.expander-content')
    let $triggers = $('.expander-trigger')
    let $curtain = $('.sliding-panel-fade-screen')
    let $thumbnails = $('.cat-entry__grid__item')
    let $catalogueEntry = $('#js-cat-entry')

    // DOM Manipulation (run once on page load)
    this.citationDate()
    this.anchorScroll(window.location.hash)
    $expanderContent.addClass('expander--hidden')
    this.searchInstance = new Search({ el: '#search-results-template' })

    // Add event handlers common to all pages
    $curtain.click(() => { this.menuToggle() })
    $menuButton.click(() => { this.menuToggle() })
    $menuCloseButton.click(() => { this.menuToggle() })
    $searchButton.click(() => { this.showSearch() })
    $searchCloseButton.click(() => { this.hideSearch() })
    $triggers.click(e => this.expandToggle(e))
    window.onkeydown = (e) => { this.keyboardControls(e) }

    let debouncedSearch = debounce(this.searchQuery, 250)
    let boundDebounce = debouncedSearch.bind(this)
    $searchInput.keydown(() => { boundDebounce() })

    // Add page-specific UI elements: Maps, catalogue details, etc.
    if ($('#map').length) { this.mapInstance = new Map() }
    if ($catalogueEntry.length > 0) {
      let entries = $catalogueEntry.data('entries')
      this.catalogueInstance = new Details({
        el: '#cat-details',
        data: { cat: entries[0] }
      })
      $thumbnails.click(e => this.showDetails(e))
    }
  }

  citationDate () {
    let today = moment().format('D MMM. YYYY')
    let $currentDate = $('.cite-current-date')
    $currentDate.empty()
    $currentDate.text(today)
  }

  removeHash () {
    if (window.location.hash.length > 0) {
      window.history.pushState('', document.title, window.location.pathname + window.location.search)
    }
  }

  anchorScroll (href) {
    href = typeof (href) === 'string' ? href : $(this).attr('href')
    var fromTop = 60

    if (href.indexOf('#') === 0) {
      var $target = $(href)

      if ($target.length) {
        $('html, body').animate({ scrollTop: $target.offset().top - fromTop })
      }
    }
  }

  keyboardControls (e) {
    let $prev = $('a#prev-link')
    let $next = $('a#next-link')

    switch (e.which) {
      case 27: // Escape key
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        // if (this.deepZoomVisible) { this.hideDetails() }
        if (this.catalogueInstance && this.catalogueInstance.visible) { this.hideDetails() }
        break
      case 37: // Left Arrow
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        // if (this.deepZoomVisible) { this.hideDetails() }
        if ($prev.length) {
          // window.location = $prev.attr('href')
          $prev.click()
        }
        break
      case 39: // Right Arrow
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        // if (this.deepZoomVisible) { this.hideDetails() }
        if ($next.length) {
          // window.location = $next.attr('href')
          $next.click()
        }
        break
    }
  }

  // TODO: Add CSS transitions to these elements to replace what JQ was doing
  expandToggle (e) {
    let el = e.currentTarget
    let targetSection = el.parentNode.querySelector('.expander-content')
    let hideClass = 'expander--hidden'

    if (targetSection.classList.contains(hideClass)) {
      targetSection.classList.remove(hideClass)
    } else {
      targetSection.classList.add(hideClass)
    }
  }

  menuToggle () {
    let sidebar = document.querySelector('.nav-sidebar')
    let curtain = document.querySelector('.sliding-panel-fade-screen')

    if (this.menuVisible) {
      sidebar.classList.remove('is-visible')
      curtain.classList.remove('is-visible')
    } else {
      sidebar.classList.add('is-visible')
      curtain.classList.add('is-visible')
    }

    this.menuVisible = !(this.menuVisible)
  }

  showDetails (e) {
    let cat = this.catNumCheck(e.target.dataset.cat)
    this.catalogueInstance.cat = cat
    this.catalogueInstance.show()
    document.querySelector('body').classList.add('noscroll')
  }

  hideDetails () {
    this.catalogueInstance.hide()
    document.querySelector('body').classList.remove('noscroll')
  }

  showSearch () {
    console.log('showSearch Fired')
    // if (!this.searchInstance) {
      // this.searchInstance = new Search({ el: '#search-results-template' })
      // console.log('Done setting up Search instance')
    // }
    if (!this.searchVisible) {
      console.log('Manipulating DOM')
      let navbar = document.querySelector('.navbar')
      let searchResults = document.querySelector('.search-results')
      navbar.classList.add('search-active')
      searchResults.classList.add('search-active')
      document.querySelector('body').classList.add('noscroll')
      this.searchVisible = true
      console.log('Finished manipulating DOM')
    }
  }

  hideSearch () {
    if (this.searchVisible) {
      let navbar = document.querySelector('.navbar')
      let searchResults = document.querySelector('.search-results')
      navbar.classList.remove('search-active')
      document.querySelector('body').classList.remove('noscroll')
      searchResults.classList.remove('search-active')
      this.searchVisible = false
    }
  }

  searchQuery () {
    let searchInput = document.querySelector('.search-field')
    let query = searchInput.value
    this.searchInstance.search(query)
  }
}

export default UI
