import Vue from 'vue'
import vueSlider from 'vue-slider-component'
import _ from 'lodash/core'
import includes from 'lodash.includes'
import geojsonData from './geojson.js'

let Catalogue = Vue.extend({
  name: 'Catalogue',
  components: {
    vueSlider
  },
  template: '#catalogue-grid-template',
  data () {
    return {
      dataURL: '/catalogue.json',
      date: [-1000, 1000],
      entries: [],
      locationsList: this.generateLocationsList(),
      ready: false,
      selection: 'ALL',
      slider: {
        min: -1000,
        max: 1000,
        interval: 50,
        tooltip: 'hover'
      }
    }
  },
  computed: {
    results () {
      return this.filterByDate()
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      let storedCatalogue = window.localStorage.getItem('catalogue')
      if (storedCatalogue) {
        this.entries = JSON.parse(storedCatalogue)
        this.results = this.entries
        this.ready = true
      } else {
        $.get(this.dataURL).done((data) => {
          window.localStorage.setItem('catalogue', JSON.stringify(data))
          this.entries = data
          this.results = this.entries
          this.ready = true
        })
      }
    },
    filterByDate () {
      return _
        .chain(this.entriesForLocation())
        .filter('date_numeric')
        .filter((entry) => {
          return entry.date_numeric[0] >= this.date[0]
        })
        .filter((entry) => {
          return entry.date_numeric[1] <= this.date[1]
        }).value()
    },
    entriesForLocation () {
      if (this.selection === 'ALL') {
        return this.entries
      } else {
        return _.filter(this.entries, (entry) => {
          return includes(this.selection, entry.cat_no)
        })
      }
    },
    generateLocationsList () {
      return _
        .chain(geojsonData.features)
        .filter(function (f) {
          return f.properties.catalogue.length > 0
        })
        .map(function (i) {
          return {
            name: i.properties.custom_name,
            type: i.properties.feature_type,
            entries: _.flatten(Array(i.properties.catalogue))
          }
        })
        .sortBy('name')
        .value()
    }
  }
})

export default Catalogue
