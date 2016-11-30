# frozen_string_literal: true
require_relative 'catalogue_resource'
require_relative 'catalogue_helpers'
require_relative 'plates_resource'
# require_relative 'zip_file_generator'

class Catalogue < Middleman::Extension
  option :catalogue_path, 'catalogue.json'
  option :plates_path, 'plates.json'
  option :output_path, 'dist/book.pdf'
  expose_to_template :sort_catalogue_contents, :catalogue_sections
  helpers CatalogueHelpers

  def initialize(app, options_hash={}, &block)
    super
    input_path  = 'extensions/filelist.txt'
    output_path = options.output_path
    flags       = '--no-artificial-fonts'

    app.after_build do |_builder|
      # zip up plates to provide as downloadable images
      # input   = 'source/assets/images/plates'
      # output  = 'source/assets/downloads/RomanMosaics_Belis_Images.zip'
      # zf      = ZipFileGenerator.new(input, output)
      # zf.write

      # generate PDF
      if environment? :pdf
        # --no-artificial-fonts flag needed to prevent faux italics
        puts `prince --input-list=#{input_path} -o #{output_path} #{flags}`
        puts `rm #{input_path}`
      end
    end
  end

  def manipulate_resource_list(resources)
    generate_pagelist if app.environment? :pdf

    resources.push Middleman::Sitemap::CatalogueResource.new(
      @app.sitemap,
      @options[:catalogue_path])

    resources.push Middleman::Sitemap::PlatesResource.new(
      @app.sitemap,
      @options[:plates_path])
    resources
  end

  # Sort Catalogue Contents
  # returns an array of resource objects ordered by sort_order attribute
  def sort_catalogue_contents
    contents = @app.sitemap.resources.find_all { |p| p.data.sort_order }
    contents.sort_by { |p| p.data.sort_order }
  end

  # Get Catalogue Sections
  # Returns 3 arrays of resource objects (frontmatter, catalogue, backmatter)
  def catalogue_sections
    contents    = sort_catalogue_contents
    frontmatter = contents.find_all { |p| p.data.sort_order <= 10 }
    backmatter  = contents.find_all { |p| p.data.sort_order > 100 }
    catalogue   = contents.find_all do |p|
      p.data.sort_order > 10 && p.data.sort_order <= 100
    end
    [frontmatter, catalogue, backmatter]
  end

  private

  def generate_pagelist
    f = File.new('./extensions/filelist.txt', 'w')
    baseurl = 'build/'
    str = '/index.html'
    frontmatter, catalogue, backmatter = catalogue_sections
    # remove index page for now
    frontmatter.shift

    # Do not include pages in PDF if pdf_output: false is set in metadata
    [frontmatter, catalogue, backmatter].each do |array|
      array.reject! { |page| page.data.pdf_output == false }
    end

    # Add print frontmatter page manually
    # f.puts baseurl + 'print-frontmatter/index.html'

    # Write the pages to the filelist for use by Prince
    [frontmatter, catalogue, backmatter].each do |array|
      array.each do |p|
        f.puts baseurl + p.destination_path.gsub('.html', str)
      end
    end
    f.close
  end
end

::Middleman::Extensions.register(:catalogue, Catalogue)
