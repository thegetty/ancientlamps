import Vue from 'vue'
import vueSlider from 'vue-slider-component'
import _ from 'lodash/core'
import includes from 'lodash.includes'
import geojsonData from './geojson.js'
import localforage from 'localforage'
import lookupData from './lookup.js'

let bgColor = '#369a87'

let Catalogue = Vue.extend({
  name: 'Catalogue',
  components: {
    vueSlider
  },
  template: '#catalogue-grid-template',
  data () {
    return {
      dataURL: '/catalogue.json',
      date: [-800, 800],
      entries: [],
      locationsList: this.generateLocationsList(),
      ready: false,
      selection: 'ALL',
      slider: {
        min: -800,
        max: 800,
        interval: 50,
        tooltip: 'always',
        tooltipDir: 'top',
        tooltipStyle: [
          {
            backgroundColor: bgColor,
            borderColor: bgColor
          },
          {
            backgroundColor: bgColor,
            borderColor: bgColor
          }
        ],
        processStyle: {
          backgroundColor: bgColor
        },
        style: {
          marginTop: '36px',
          paddingLeft: '24px',
          paddingRight: '24px'
        }
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
    entryLink (catNumber) {
      let match = _.find(lookupData, (i) => {
        if (typeof i.cat_no === 'number' || typeof i.cat_no === 'string') {
          return i.cat_no === catNumber
        } else {
          return includes(i.cat_no, catNumber)
        }
      })
      if (match) {
        return `${match.path}/#${catNumber}`
      } else {
        return undefined
      }
    },
    getData () {
      localforage.getItem('catalogue').then((data) => {
        this.entries = data
        this.results = this.entries
        this.ready = true
      }).catch(function (error) {
        console.log(error)
      })
    },
    filterByDate () {
      return _
        .chain(this.entriesForLocation())
        .filter('date_numeric')
        .filter((entry) => {
          // workaround for cat 456
          if (entry.no_entry && this.date[0] !== this.slider.min) {
            return null
          }
          // min date
          if (this.date[0] === this.slider.min) {
            return entry
          } else {
            return entry.date_numeric[0] >= this.date[0] || entry.date_numeric[1] >= this.date[0]
          }
        })
        .filter((entry) => {
          // workaround for cat 456
          if (entry.no_entry && this.date[1] !== this.slider.max) {
            return null
          }
          // max date
          if (this.date[1] === this.slider.max) {
            return entry
          } else {
            return entry.date_numeric[1] <= this.date[1] || entry.date_numeric[0] <= this.date[1]
          }
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
    },
    formatter (value) {
      if (value === this.slider.max) {
        return value + ' AD+'
      } else if (value < 0) {
        return Math.abs(value) + ' BC'
      } else {
        return value + ' AD'
      }
    }
  },
  filters: {
    stringifyBis (value) {
      if (!value) return ''
      value = value.toString()
      return value.replace('-', ' ')
    }
  }
})

export default Catalogue
