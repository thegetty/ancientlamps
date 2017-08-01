# frozen_string_literal: true
require_relative './xml_structs.rb'

module Book
  class Chapter < Middleman::Sitemap::Resource
    include XMLStructs
    attr_reader :book

    # Pass in a reference to the parent Book extension for later use
    def initialize(store, path, source, book)
      super(store, path, source)
      @book = book
    end

    def file_name
      File.basename(path, ".html")
    end

    def title
      data.title || catalogue_entry_title
    end

    def catalogue_entry_title
      data.hierarchy.last.values.join
    end

    def author
      data.author || @book.author
    end

    def rank
      data.sort_order
    end

    def body
      render layout: false
    end

    def next_chapter
      @book.chapters.select { |p| p.rank > rank }.min_by(&:rank)
    end

    def prev_chapter
      @book.chapters.select { |p| p.rank < rank }.max_by(&:rank)
    end

    # Generate a navpoint tag for epub toc.ncx navmap
    def generate_navpoint
      NavPoint.new(nil, nil, "#{file_name}.xhtml", title)
    end

    # Generate an item tag for epub manifest
    def generate_item_tag
      ItemTag.new("c#{rank}", "#{file_name}.xhtml", 'application/xhtml+xml', nil)
    end

    # Generate an itemref tag for epub spine
    def idref
      "c#{rank}"
    end

    def format_images_for_epub(images)
      relative_link_regex = /^(\.\/?)+/
      images.each do |image|
        image['src'] = image['src'].gsub(relative_link_regex, '')
      end
    end

    def format_links_for_epub(links)
      strip_map_links(links)
      fix_relative_links(links)
      fix_catalogue_entry_links(links)
      fix_catalogue_section_links(links)
      fix_internal_catalogue_links(links)
      fix_biblio_links(links)
    end

    def fix_biblio_links(links)
      biblio_regex = /^bibliography\/(#\S+$)/

      links.each do |link|
        link['href'] = link['href'].gsub(biblio_regex, 'bibliography.xhtml\1')
      end
    end

    def fix_relative_links(links)
      relative_link_regex = /^(\.+)(\/)(\.+\/)?/
      links.each do |link|
        next if link['href'].nil?
        next if link['href'].match(/^http:|https:/)
        link['href'] = link['href'].gsub(relative_link_regex, '')
        link['href'] = link['href'].gsub(/\/$/, '.xhtml')
      end
    end

    def strip_map_links(links)
      links.each do |link|
        link.replace(link.inner_html) if link['href'].nil?
        link.replace(link.inner_html) if link['href'].include?('map/#loc_')
      end
    end

    def fix_catalogue_section_links(links)
      links.each do |link|
        link['href'] = link['href'].gsub(/^catalogue\//, '')
      end
    end

    def fix_catalogue_entry_links(links)
      catalogue_regex = /^catalogue\/([0-9|a-z|-]+)\/#([0-9|a-z|-]+)/

      links.each do |link|
        link['href'] = link['href'].gsub(catalogue_regex) do |s|
          "#{$1}.xhtml#cat-#{$2}"
        end
      end
    end

    def fix_internal_catalogue_links(links)
      internal_catalogue_regex = /([0-9|-]+)\/#([0-9|a-z|-]+)/

      links.each do |link|
        link['href'] = link['href'].gsub(internal_catalogue_regex) do |s|
          "#{$1}.xhtml#cat-#{$2}"
        end
      end
    end

    def format_for_epub
      if data.cat
        doc = Nokogiri::XML((render :layout => 'epub_cat_entry'))
      else
        doc = Nokogiri::XML((render :layout => 'epub_chapter'))
      end

      format_images_for_epub(doc.css('img'))
      format_links_for_epub(doc.css('a'))
      doc.to_xml
    end
  end
end
