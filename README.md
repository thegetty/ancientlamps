This is the repository for *Ancient Lamps in the J. Paul Getty Museum* by Jean Bussière and Birgitta Lindros Wohl, published in August 2017 by the J. Paul Getty Museum. It is available online at [http://www.getty.edu/publications/ancientlamps](http://www.getty.edu/publications/ancientlamps) and may be downloaded free of charge in multiple formats.

## About the Book

Some 630 lamps in the J. Paul Getty Museum represent production centers that were active across the ancient Mediterranean world between 800 B.C. and A.D. 800. Notable for their marvelous variety—from simple clay saucers that held just oil and a wick to elaborate figural lighting fixtures in bronze and precious metals—the Getty lamps display a number of unprecedented shapes and decors. Most were made in Roman workshops, which met the ubiquitous need for portable illumination in residences, public spaces, religious sanctuaries, and the grave. The omnipresent oil lamp is a font of popular imagery, illustrating myths, nature, and the activities and entertainments of daily life. Presenting a largely unpublished collection, this extensive catalogue is an invaluable resource for specialists in lychnology, art history, and archaeology alike.

## About this Repository

This is the third in series of multi-format online collection catalogues using a new toolchain built with [Middleman](https://github.com/middleman/middleman), an open-source [static site generator](https://www.smashingmagazine.com/2015/11/modern-static-website-generators-next-big-thing/). (The first two were [*Ancient Terracottas from South Italy and Sicily in the J. Paul Getty Museum*](http://www.getty.edu/publications/terracottas) and [*Roman Mosaics in the J. Paul Getty Museum*](http://www.getty.edu/publications/romanmosaics).) Middleman and the other associated open-source software used here allow us to produce each format (e.g., PDF, EPUB, MOBI)  from a single set of source files. Our aim is to use open web technologies and plain-text file formats to ensure the book’s longevity and portability, while still achieving a high level of design and interactivity.

The research presented here has been thoroughly edited and peer-reviewed and meets the same standards as all [Getty Publications](http://www.getty.edu/publications/) titles. We are dedicated to maintaining the book for years to come at the permanent URL, [http://www.getty.edu/publications/ancientlamps](http://www.getty.edu/publications/ancientlamps), and in its various formats and incarnations. For any updates to the book, we will be following something between an app and traditional book publication model. Updates will only be made in regulated chunks as formal revisions and new editions and will always be thoroughly documented here in the repository, as well as in the Revision History included with each of the book’s many formats.

The primary content pieces of the book can be found in the `data` and `source` directories. The master branch represents the current, published edition at all times, and the revisions branch, when present, shows changes currently under consideration. We invite you to submit suggestions or corrections via pull request on the revisions branch, by posting an issue, or by emailing us at [pubsinfo@getty.edu](mailto:pubsinfo@getty.edu).

## Using the Code

While stable, the structure and code of this particular repository are very much in a prototype stage, and making use of this existing project as the basis for new work should be done with caution. Getty Publications is currently at work on more catalogues and other online publications, and we are refining our approach and rebuilding large portions of the code—all with an eye toward releasing a stable, open-source development-friendly version for broad use. That version is called Quire and is built on the Hugo static-site generator rather than on Middleman which is used here.

The following instructions are for macOS and assume you already have this project’s main dependencies installed on your machine: Ruby, RubyGems, Bundler, Node.js, and PrinceXML. Visit our [Middleman Setup Guide](#) for more information on those dependencies and for specific installation instructions.

Open your Terminal and take the following steps:

1. Clone this repository:

    ```
    git clone https://github.com/gettypubs/ancientlamps.git
    ```

2. Move into the repository folder:

    ```
    cd ancientlamps
    ```

3. Install the project’s required Node modules and Gems:

    ```
    npm install
    ```
    ```
    bundle install
    ```

4. Run a preview of site in your browser at http://localhost:4567:

    ```
    bundle exec middleman
    ```

### Adding the Fonts

The sans-serif font, Karla, and the icons font, Ionicons, used in this publication are both open license fonts and already included in the repository.

The main body font used in this publication is Freight Text Pro, which requires a license to use and so is not included in this repository. To use it, you can [purchase a license](https://www.myfonts.com/fonts/garagefonts/freight-text-pro/), and add the font files into the `source/assets/fonts` directory. Otherwise the browser default serif font will be used. The following five Freight Text Pro faces are used, and we recommend including the EOT, TTF, WOFF, and WOFF2 files for each for maximum browser support.

- Freight Text Pro Book
- Freight Text Pro Book Italic
- Freight Text Pro Book Smallcaps
- Freight Text Pro Bold
- Freight Text Pro Bold Italic

*Warning: If you do add licensed fonts, be sure not to commit them into any git repository that be will public as this will improperly exposed the font files for misuse.*

### Updating the URL

For search, zooming images, and the catalogue grid to properly work, temporarily update the urls prefix in `source/assets/javascripts/application.js` to `http://localhost:4567`.

The URL prefix should also be updated here and in data/book.yml when deploying to the publication to a site other than the Getty’s instance.

```
urls: {
  search: '/search.json',
  catalogue: '/catalogue.json',
  plates: '/plates.json',
  // prefix: 'http://www.getty.edu/publications/ancientlamps'
  prefix: 'http://localhost:4567'
},
```

### Outputting Files

Build the Site: `bundle exec middleman build`

Build the PDF: `bundle exec middleman build -e pdf`

Build the EPUB: `bundle exec middleman build -e epub`


## License

Ancient Lamps © 2017 J. Paul Getty Trust. This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

Proteus Middleman © 2014–2015 [thoughtbot, inc](http://thoughtbot.com). Proteus Middleman is free software and may be redistributed under the terms specified in the [license](https://github.com/thoughtbot/bourbon/blob/master/LICENSE.md).
