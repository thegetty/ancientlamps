# frozen_string_literal: true

require_relative 'book/helpers.rb'
require_relative 'book/book_chapter.rb'
require_relative 'book/epub.rb'

require_relative 'catalogue_resource'
require_relative 'plates_resource'

module Book
  class BookExtension < Middleman::Extension
    helpers Book::Helpers
    option :ebook_cover, false, 'Name of an optional cover image'
    option :output_filename, 'book', 'Filename of resulting .pdf, .epub, etc'
    option :output_dir, 'dist', 'Directory to output PDF and EPUB files'
    option :pdf_output_path, 'dist/book.pdf', 'Where to write generated PDF'
    option :epub_output_path, 'dist/epub/', 'Where to write generated EPUB files'
    option :prince_cli_flags, '--no-artificial-fonts', 'Flags for Prince cli'

    option :catalogue_path, 'catalogue.json'
    option :plates_path, 'plates.json'
    option :max_frontmatter_sort_value, 10, 'Max sort_order value for frontmatter content'
    option :max_catalogue_sort_value, 200, 'Max sort_order value for catalogue entries'

    expose_to_template :chapters, :book_title, :author
    expose_to_application :chapters

    attr_reader :chapters, :title, :author, :info, :cover
    attr_accessor :manifest, :navmap

    def initialize(app, options_hash={}, &block)
      super
      @info     = @app.data.book
      @title    = info.title.main
      @author   = info.author_as_it_appears
      @cover    = options.ebook_cover
      @chapters = []
      @manifest = []
      @navmap   = []

      app.after_build do |_builder|
        book = app.extensions[:book]
        book.generate_pdf! if environment? :pdf
        book.generate_epub! if environment? :epub
      end
    end

    def manipulate_resource_list(resources)
      resources.push Middleman::Sitemap::CatalogueResource.new(@app.sitemap, @options[:catalogue_path])
      resources.push Middleman::Sitemap::PlatesResource.new(@app.sitemap, @options[:plates_path])

      generate_chapters!(resources)
      resources
    end

    def generate_epub!
      epub_file   = File.join(options.output_dir, "#{options.output_filename}.epub")
      working_dir = File.join(options.output_dir, 'epub')

      FileUtils.rm(epub_file) if File.exist?(epub_file)
      epub = Epub.new(self, chapters, working_dir)
      epub.build(app.sitemap)

      puts `epzip #{working_dir} #{epub_file}`
    end

    def generate_pdf!
      pdf_file = "#{options.output_dir}/#{options.output_filename}.pdf"
      pagelist = generate_pagelist
      flags    = options.prince_cli_flags
      puts `prince #{pagelist} -o #{pdf_file} #{flags}`
    end

    def book_title
      title
    end

    def book_sections
      [frontmatter_chapters, catalogue_chapters, backmatter_chapters]
    end

    def frontmatter_chapters
      max = options.max_frontmatter_sort_value
      chapters.find_all { |c| c.data.sort_order <= max && c.data.sort_order > 0 }
    end

    def catalogue_chapters
      min = options.max_frontmatter_sort_value
      max = options.max_catalogue_sort_value
      chapters.find_all { |c| c.data.sort_order > min && c.data.sort_order <= max }
    end

    def backmatter_chapters
      min = options.max_catalogue_sort_value
      chapters.find_all { |c| c.data.sort_order > min }
    end

    private

    def generate_pagelist
      pagelist = ''
      baseurl = @app.config.build_dir + '/'

      pagelist += baseurl + 'print-frontmatter.html '

      # frontmatter_chapters.each { |c| pagelist += baseurl + c.destination_path + ' ' }

      frontmatter_chapters.each do |c|
        next if c.path == "map.html"
        pagelist += baseurl + c.destination_path + ' '
      end

      catalogue_chapters.each { |c| pagelist += baseurl + c.destination_path + ' ' }

      backmatter_chapters.each do |c|
        next if c.path == "about.html"
        pagelist += baseurl + c.destination_path + ' '
      end

      pagelist
    end

    def generate_chapters!(resources)
      resources.find_all { |p| p.data.sort_order }.each do |p|
        source = p.source_file
        path = p.destination_path
        metadata = p.metadata
        chapter = Book::Chapter.new(@app.sitemap, path, source, self)
        chapter.add_metadata(metadata)
        resources.delete p
        resources.push chapter
        @chapters.push chapter
      end

      # Keep chapters from duplicating themselves endlessly on each livereload
      @chapters.uniq! { |p| p.data.sort_order }
      @chapters.sort_by! { |p| p.data.sort_order }
    end
  end

  ::Middleman::Extensions.register(:book, BookExtension)
end
