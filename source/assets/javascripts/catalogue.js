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
      <h1>Entries: {{entries.length}}</h1>
      <vue-slider
        ref="slider"
        :min="slider.min"
        :max="slider.max"
        :interval="slider.interval"
        :tooltip="slider.tooltip"
        tooltip-dir="bottom"
        v-model="date">
      </vue-slider>
    </div>
  `,
  data () {
    return {
      dataURL: '/catalogue.json',
      date: [-1000, 1000],
      entries: [],
      slider: {
        min: -1000,
        max: 1000,
        interval: 50,
        tooltip: 'hover'
      }
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
      } else {
        $.get(this.dataURL).done((data) => {
          window.localStorage.setItem('catalogue', JSON.stringify(data))
          this.entries = data
        })
      }
    }
  }
})

export default Catalogue
