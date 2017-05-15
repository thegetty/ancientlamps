import Vue from 'vue'
import vueSlider from 'vue-slider-component'
import _ from 'lodash/core'

let Catalogue = Vue.extend({
  name: 'Catalogue',
  components: {
    vueSlider
  },
  template: `
    <div>
      <div v-if="ready">
        <h2>Entries: {{results.length}}</h2>
        <vue-slider
          ref="slider"
          :min="slider.min"
          :max="slider.max"
          :interval="slider.interval"
          :tooltip="slider.tooltip"
          tooltip-dir="bottom"
          v-model="date">
        </vue-slider>
        <div class="cat-entry__grid">
          <div
            v-for="item in results"
            class="cat-entry__grid__item"
            :data-cat="item.cat_no">
              <h6 class="cat-entry__grid__item__number">{{ item.cat_no }}</h6>
          </div>
        </div>
      </div>
      <div v-else>
        Loading...
      </div>
    </div>
  `,
  data () {
    return {
      dataURL: '/catalogue.json',
      date: [-1000, 1000],
      entries: [],
      ready: false,
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
        .chain(this.entries)
        .filter('date_numeric')
        .filter((entry) => {
          return entry.date_numeric[0] >= this.date[0]
        })
        .filter((entry) => {
          return entry.date_numeric[1] <= this.date[1]
        }).value()
    }
  }
})

export default Catalogue
