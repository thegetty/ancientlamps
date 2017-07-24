// import _ from 'lodash/core'
import debounce from 'lodash.debounce'
import moment from 'moment'
import Map from './map.js'
import Search from './search.js'
import Details from './details.js'
import Catalogue from './catalogue.js'

class UI {
  constructor () {
    // Properties
    this.menuVisible = false
    this.searchVisible = false
    this.searchInstance = null
    this.catalogueInstance = null
    this.mapInstance = null
    this.gridInstance = null

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
    this.citationDate()
    let $expanderContent = $('.expander-content')
    $expanderContent.addClass('expander--hidden')

    this.anchorScroll(window.location.hash)

    this.searchInstance = new Search({ el: '#search-results-template' })
    this.setupCommonEventHandlers()
    this.setupMapIfNecessary()
    this.setupCatalogueGridIfNecessary()
    this.setupDetailsIfNecessary()

    if (window.location.hash.length > 0 && this.catalogueInstance !== null) {
      this.toggleDetailsOnHashChange({newURL: window.location.hash})
    }
  }

  setupCommonEventHandlers () {
    let $menuButton = $('#navbar-menu')
    let $menuCloseButton = $('#nav-menu-close')
    let $searchButton = $('#navbar-search')
    let $searchCloseButton = $('#search-close')
    let $searchInput = $('.search-field')
    let $triggers = $('.expander-trigger')
    let $curtain = $('.sliding-panel-fade-screen')
    let $footnoteLinks = $('.footnote, .reversefootnote')

    $curtain.click(() => { this.menuToggle() })
    $menuButton.click(() => { this.menuToggle() })
    $menuCloseButton.click(() => { this.menuToggle() })
    $searchButton.click(() => { this.showSearch() })
    $searchCloseButton.click(() => { this.hideSearch() })
    $triggers.click((e) => { this.expandToggle(e) })
    $footnoteLinks.click((e) => { this.footnoteScroll(e) })

    window.onkeydown = (e) => { this.keyboardControls(e) }
    window.onhashchange = (e) => { this.toggleDetailsOnHashChange(e) }
    window.addEventListener('catalogue', () => {
      if (this.gridInstance) { this.gridInstance.getData() }
    })

    // Remove "stale" background images when catalogue grid refreshes its contents
    window.addEventListener('lazyunveilread', (e) => {
      e.target.removeAttribute('style')
    })

    let debouncedSearch = debounce(this.searchQuery, 250)
    let boundDebounce = debouncedSearch.bind(this)
    $searchInput.keydown(() => { boundDebounce() })
  }

  setupMapIfNecessary () {
    let $map = $('#map')
    if ($map.length > 0) { this.mapInstance = new Map() }
  }

  setupCatalogueGridIfNecessary () {
    let $catalogue = $('#js-catalogue')
    if ($catalogue.length > 0) {
      this.gridInstance = new Catalogue({el: '#js-catalogue'})
    }
  }

  setupDetailsIfNecessary () {
    let $catalogueEntry = $('#js-cat-entry')

    if ($catalogueEntry.length > 0) {
      let $thumbnails = $('.cat-entry__grid__item')
      $thumbnails.click(e => this.showDetails(e))
      let entries = $catalogueEntry.data('entries')

      let $blankEntry = $('.cat-entry__grid__item[data-cat="456"]')
      if ($blankEntry.length > 0) {
        $blankEntry.off()
      }

      // Avoid a possible race condition here if user goes directly to a
      // details hash url?
      this.catalogueInstance = new Details({
        el: '#cat-details',
        data: { cat: entries[0] }
      })
    }
  }

  citationDate () {
    let today = moment().format('D MMMM YYYY')
    let $currentDate = $('.cite-current-date')
    $currentDate.empty()
    $currentDate.text(today)
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

  footnoteScroll (event) {
    function formatID (id) { return id.replace(/(:|\.|\[|\]|,)/g, '\\$1') }

    var fromTop = 60
    var target = event.currentTarget.hash
    var distance = $(formatID(target)).offset().top
    $('html, body').animate({scrollTop: distance - fromTop}, 250)
    history.pushState({id: 'main'}, document.title, target)
  }

  keyboardControls (e) {
    let $prev = $('a#prev-link')
    let $next = $('a#next-link')

    switch (e.which) {
      case 27: // Escape key
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        if (this.catalogueInstance && this.catalogueInstance.visible) {
          this.catalogueInstance.hide()
        }
        break
      case 37: // Left Arrow
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        if ($prev.length) {
          $prev.click()
        }
        break
      case 39: // Right Arrow
        if (this.menuVisible) { this.menuToggle() }
        if (this.searchVisible) { this.hideSearch() }
        if ($next.length) {
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
    if (!this.catalogueInstance) {
      this.catalogueInstance = new Details({
        el: '#cat-details',
        data: { cat: cat }
      })
    } else {
      this.catalogueInstance.cat = cat
    }
    this.catalogueInstance.show()
    document.querySelector('body').classList.add('noscroll')
    history.pushState({id: 'main'}, `Cat. ${cat}`, `#${cat}`)
  }

  toggleDetailsOnHashChange (e) {
    if (arguments.length > 0) {
      let hash = this.catNumCheck(e.newURL.split('#')[1])
      // console.log(hash)

      let $catalogueEntry = $('#js-cat-entry')
      let entries = $catalogueEntry.data('entries')

      // if we are on a catalogue page and the hash exists as an entry on the current page
      if ($catalogueEntry.length > 0 && entries.indexOf(hash) > -1) {
        this.catalogueInstance.cat = hash
        window.setTimeout(this.catalogueInstance.show, 100)

      // If the user has hit "Back" to get out of a details view
      } else if (this.catalogueInstance &&
                 this.catalogueInstance.visible &&
                 typeof hash === 'undefined') {
        this.catalogueInstance.hide()
      }

      // If the user hits the close button or hits escape, or manually removes the hash
      if ($catalogueEntry.length > 0 && hash === 0) {
        this.catalogueInstance.hide()
      }
    }
  }

  showSearch () {
    if (!this.searchVisible) {
      // if (!this.searchInstance.ready) { this.searchInstance.loadData() }
      let navbar = document.querySelector('.navbar')
      let searchResults = document.querySelector('.search-results')
      navbar.classList.add('search-active')
      searchResults.classList.add('search-active')
      document.querySelector('body').classList.add('noscroll')
      this.searchVisible = true
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
